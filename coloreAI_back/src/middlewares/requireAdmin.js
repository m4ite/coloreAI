const pool = require("../config/database");

// Deve ser usado DEPOIS do authMiddleware.
// Consulta o banco a cada requisição (em vez de confiar só no role do JWT),
// para que rebaixamento/desativação tenham efeito imediato.
const requireAdmin = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT role, active FROM users WHERE id = $1",
            [req.user.id],
        );
        const user = result.rows[0];

        if (!user || !user.active) {
            return res
                .status(401)
                .json({ message: "Usuário não encontrado ou desativado." });
        }
        if (user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Acesso restrito a administradores." });
        }

        req.user.role = user.role;
        next();
    } catch (error) {
        console.error("Erro ao verificar permissão de admin:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

module.exports = requireAdmin;
