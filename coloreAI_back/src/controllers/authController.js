const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../config/database");

const normalizeEmail = (email) =>
    String(email || "")
        .trim()
        .toLowerCase();

function getMailTransport() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
        process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error(
            "Configuração SMTP incompleta. Defina SMTP_HOST, SMTP_USER e SMTP_PASS no .env.",
        );
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: String(SMTP_SECURE || "false").toLowerCase() === "true",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
}

const register = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = normalizeEmail(req.body.email);
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Nome, email e senha são obrigatórios." });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({ message: "A senha deve ter pelo menos 8 caracteres." });
        }
        const userExists = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1",
            [email],
        );
        if (userExists.rows.length > 0) {
            return res
                .status(409)
                .json({ message: "Este email já está cadastrado." });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, active, created_at`,
            [name, email, passwordHash],
        );
        return res.status(201).json({
            message: "Usuário criado com sucesso.",
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { password } = req.body;
        if (!email || !password)
            return res
                .status(400)
                .json({ message: "Email e senha são obrigatórios." });
        const result = await pool.query(
            `SELECT id, name, email, password_hash, role, active FROM users WHERE LOWER(email) = $1`,
            [email],
        );
        if (result.rows.length === 0)
            return res
                .status(401)
                .json({ message: "Email ou senha inválidos." });
        const user = result.rows[0];
        if (!user.active)
            return res
                .status(403)
                .json({ message: "Esta conta está desativada." });
        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res
                .status(401)
                .json({ message: "Email ou senha inválidos." });
        }
        if (!process.env.JWT_SECRET)
            throw new Error("JWT_SECRET não configurado.");
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
        );
        return res.json({
            message: "Login realizado com sucesso.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const me = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email, role, active, created_at FROM users WHERE id = $1",
            [req.user.id],
        );
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Usuário não encontrado." });
        return res.json({ user: result.rows[0] });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const forgotPassword = async (req, res) => {
    const email = normalizeEmail(req.body.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res
            .status(400)
            .json({ message: "Informe um endereço de e-mail válido." });
    }
    try {
        const result = await pool.query(
            "SELECT id, email, name FROM users WHERE LOWER(email) = $1 AND active = TRUE",
            [email],
        );
        if (result.rows.length) {
            const user = result.rows[0];
            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            // Invalida solicitações anteriores do mesmo usuário.
            await pool.query(
                "DELETE FROM password_reset_tokens WHERE user_id = $1",
                [user.id],
            );
            await pool.query(
                `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                 VALUES ($1, $2, $3)`,
                [user.id, tokenHash, expiresAt],
            );

            const frontendUrl = (
                process.env.FRONTEND_URL || "http://localhost:5173"
            ).replace(/\/$/, "");

            const resetUrl = `${frontendUrl}/?token=${encodeURIComponent(rawToken)}`;

            const text = [
                `Olá${user.name ? `, ${user.name}` : ""}!`,
                "",
                "Recebemos uma solicitação para redefinir sua senha no ColoreAI.",
                "Acesse o link abaixo para criar uma nova senha:",
                resetUrl,
                "",
                "Se você não solicitou essa alteração, ignore este e-mail.",
            ].join("\n");

            const safeUrl = escapeHtml(resetUrl);
            const html = `
        <p>Olá${user.name ? `, ${escapeHtml(user.name)}` : ""}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha no ColoreAI.</p>
        <p>Acesse o link abaixo para criar uma nova senha:</p>
        <p><a href="${safeUrl}">${safeUrl}</a></p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
      `;

            const from = process.env.MAIL_FROM || process.env.SMTP_USER;
            const transport = getMailTransport();

            console.log("SMTP configurado:", {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                userConfigurado: Boolean(process.env.SMTP_USER),
                senhaConfigurada: Boolean(process.env.SMTP_PASS),
                destinatario: user.email,
            });

            const info = await transport.sendMail({
                from: from ? `ColoreAI <${from}>` : undefined,
                to: user.email,
                subject: "Recuperação de senha - ColoreAI",
                text,
                html,
            });

            console.log("Resultado do envio:", {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
            });
        }
        return res.status(200).json({
            message:
                "Se houver uma conta associada a este endereço, você receberá um link de recuperação.",
        });
    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        return res.status(500).json({
            message:
                "Não foi possível enviar o e-mail de recuperação. Verifique a configuração do servidor de e-mail.",
        });
    }
};

function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (char) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[char],
    );
}

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password)
        return res
            .status(400)
            .json({ message: "Token e nova senha são obrigatórios." });
    if (typeof password !== "string" || password.length < 8) {
        return res
            .status(400)
            .json({ message: "A senha deve ter pelo menos 8 caracteres." });
    }
    try {
        const tokenHash = crypto
            .createHash("sha256")
            .update(String(token))
            .digest("hex");
        const found = await pool.query(
            `SELECT prt.id AS reset_id, prt.user_id
             FROM password_reset_tokens prt
             JOIN users u ON u.id = prt.user_id
             WHERE prt.token_hash = $1 AND prt.expires_at > NOW() AND u.active = TRUE`,
            [tokenHash],
        );
        if (!found.rows.length)
            return res.status(400).json({
                message:
                    "Link inválido ou expirado. Solicite uma nova recuperação.",
            });
        const { reset_id, user_id } = found.rows[0];
        const passwordHash = await bcrypt.hash(password, 10);
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(
                "UPDATE users SET password_hash = $1 WHERE id = $2",
                [passwordHash, user_id],
            );
            // Tokens são de uso único: remove todos os tokens do usuário após a troca.
            await client.query(
                "DELETE FROM password_reset_tokens WHERE user_id = $1",
                [user_id],
            );
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
        return res.json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return res
            .status(500)
            .json({ message: "Erro interno ao redefinir a senha." });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Informe a senha atual e a nova senha." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                message: "A nova senha deve ter pelo menos 8 caracteres.",
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "A nova senha deve ser diferente da senha atual.",
            });
        }

        const result = await pool.query(
            "SELECT id, password_hash FROM users WHERE id = $1 AND active = TRUE",
            [req.user.id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado ou conta desativada.",
            });
        }
        const user = result.rows[0];
        const passwordCorrect = await bcrypt.compare(
            currentPassword,
            user.password_hash,
        );
        if (!passwordCorrect) {
            return res
                .status(400)
                .json({ message: "A senha atual está incorreta." });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
            passwordHash,
            user.id,
        ]);
        return res.json({ message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        return res
            .status(500)
            .json({ message: "Erro interno ao alterar a senha." });
    }
};

module.exports = {
    register,
    login,
    me,
    forgotPassword,
    resetPassword,
    changePassword,
};
