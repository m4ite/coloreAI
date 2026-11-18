const pool = require("../config/database");

const VALID_ROLES = ["user", "admin"];
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/admin/users?search=
const listUsers = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const params = [];
        let where = "";
        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            where = "WHERE LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1";
        }
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.active, u.created_at,
                    COUNT(c.id)::int AS colorizations
             FROM users u
             LEFT JOIN colorizations c ON c.user_id = u.id
             ${where}
             GROUP BY u.id
             ORDER BY u.created_at DESC`,
            params,
        );
        return res.json({ users: result.rows });
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

// Altera role/active de um usuário garantindo que sempre reste
// ao menos um admin ativo. Roda em transação com lock nas linhas de admin
// para evitar corrida entre dois admins se rebaixando ao mesmo tempo.
async function updateUserGuarded(req, res, field, value) {
    const targetId = req.params.id;

    if (!UUID_RE.test(targetId)) {
        return res.status(400).json({ message: "ID de usuário inválido." });
    }
    if (targetId === req.user.id) {
        return res.status(400).json({
            message:
                field === "role"
                    ? "Você não pode alterar o seu próprio papel."
                    : "Você não pode desativar a sua própria conta.",
        });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Lock em todos os admins ativos + no alvo.
        const admins = await client.query(
            "SELECT id FROM users WHERE role = 'admin' AND active = TRUE FOR UPDATE",
        );
        const target = await client.query(
            "SELECT id, role, active FROM users WHERE id = $1 FOR UPDATE",
            [targetId],
        );
        if (!target.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const t = target.rows[0];
        const targetIsActiveAdmin = t.role === "admin" && t.active;
        const willLoseAdmin =
            targetIsActiveAdmin &&
            ((field === "role" && value !== "admin") ||
                (field === "active" && value === false));

        if (willLoseAdmin && admins.rows.length <= 1) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "O sistema precisa ter pelo menos um administrador ativo.",
            });
        }

        const updated = await client.query(
            `UPDATE users SET ${field === "role" ? "role" : "active"} = $1
             WHERE id = $2
             RETURNING id, name, email, role, active, created_at`,
            [value, targetId],
        );

        // Remove tokens de recuperação pendentes de contas desativadas.
        if (field === "active" && value === false) {
            await client.query(
                "DELETE FROM password_reset_tokens WHERE user_id = $1",
                [targetId],
            );
        }

        await client.query("COMMIT");
        return res.json({
            message: "Usuário atualizado com sucesso.",
            user: updated.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Erro ao atualizar ${field} do usuário:`, error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    } finally {
        client.release();
    }
}

// PATCH /api/admin/users/:id/role  { role: "user" | "admin" }
const updateUserRole = (req, res) => {
    const { role } = req.body || {};
    if (!VALID_ROLES.includes(role)) {
        return res
            .status(400)
            .json({ message: "Papel inválido. Use 'user' ou 'admin'." });
    }
    return updateUserGuarded(req, res, "role", role);
};

// PATCH /api/admin/users/:id/status  { active: true | false }
const updateUserStatus = (req, res) => {
    const { active } = req.body || {};
    if (typeof active !== "boolean") {
        return res
            .status(400)
            .json({ message: "O campo 'active' deve ser true ou false." });
    }
    return updateUserGuarded(req, res, "active", active);
};

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [users, colorizations, metrics, daily] = await Promise.all([
            pool.query(
                `SELECT COUNT(*)::int AS total,
                        COUNT(*) FILTER (WHERE active)::int AS active,
                        COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
                        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS new_this_month
                 FROM users`,
            ),
            pool.query(
                `SELECT COUNT(*)::int AS total,
                        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
                        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
                        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
                        COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::int AS today,
                        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours' AND status <> 'processing')::int AS finished_24h,
                        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours' AND status = 'failed')::int AS failed_24h,
                        AVG(processing_time) FILTER (WHERE status = 'completed') AS avg_processing_time
                 FROM colorizations`,
            ),
            pool.query(
                `SELECT AVG(psnr) AS avg_psnr, AVG(ssim) AS avg_ssim
                 FROM colorization_metrics`,
            ),
            pool.query(
                `SELECT to_char(d, 'YYYY-MM-DD') AS day,
                        (SELECT AVG(m.psnr) FROM colorization_metrics m WHERE m.created_at::date = d::date) AS psnr,
                        (SELECT AVG(m.ssim) FROM colorization_metrics m WHERE m.created_at::date = d::date) AS ssim,
                        (SELECT COUNT(*) FROM colorization_metrics m WHERE m.created_at::date = d::date)::int AS count,
                        (SELECT AVG(c.processing_time) FROM colorizations c
                          WHERE c.created_at::date = d::date AND c.status = 'completed') AS avg_processing_time
                 FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, '1 day') d
                 ORDER BY d`,
            ),
        ]);

        const num = (v) => (v === null || v === undefined ? null : Number(v));

        return res.json({
            users: users.rows[0],
            colorizations: {
                ...colorizations.rows[0],
                avg_processing_time: num(
                    colorizations.rows[0].avg_processing_time,
                ),
            },
            quality: {
                avg_psnr: num(metrics.rows[0].avg_psnr),
                avg_ssim: num(metrics.rows[0].avg_ssim),
                last_7_days: daily.rows.map((r) => ({
                    day: r.day,
                    psnr: num(r.psnr),
                    ssim: num(r.ssim),
                    count: r.count,
                    avg_processing_time: num(r.avg_processing_time),
                })),
            },
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

// GET /api/admin/logs?limit=50&offset=0
const listLogs = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
        const result = await pool.query(
            `SELECT l.id, l.action, l.description, l.created_at,
                    l.user_id, u.name AS user_name, u.email AS user_email
             FROM monitoring_logs l
             LEFT JOIN users u ON u.id = l.user_id
             ORDER BY l.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset],
        );
        return res.json({ logs: result.rows, limit, offset });
    } catch (error) {
        console.error("Erro ao listar logs:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

// GET /api/admin/colorizations?limit=20 — últimas colorizações do sistema
const listColorizations = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
        const result = await pool.query(
            `SELECT c.id, c.status, c.processing_time, c.error_message, c.created_at,
                    u.name AS user_name, m.psnr, m.ssim
             FROM colorizations c
             LEFT JOIN users u ON u.id = c.user_id
             LEFT JOIN colorization_metrics m ON m.colorization_id = c.id
             ORDER BY c.created_at DESC
             LIMIT $1`,
            [limit],
        );
        const num = (v) => (v === null || v === undefined ? null : Number(v));
        return res.json({
            colorizations: result.rows.map((r) => ({
                ...r,
                psnr: num(r.psnr),
                ssim: num(r.ssim),
            })),
        });
    } catch (error) {
        console.error("Erro ao listar colorizações:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

module.exports = {
    listColorizations,
    listUsers,
    updateUserRole,
    updateUserStatus,
    getStats,
    listLogs,
};
