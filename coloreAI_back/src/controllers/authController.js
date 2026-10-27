const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
        }
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, active, created_at`,
            [name, email, passwordHash]
        );
        return res.status(201).json({ message: "Usuário criado com sucesso.", user: result.rows[0] });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }
        const result = await pool.query(
            `SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }
        const user = result.rows[0];
        if (!user.active) {
            return res.status(403).json({ message: "Esta conta está desativada." });
        }
        const passwordCorrect = await bcrypt.compare(password, user.password_hash);
        if (!passwordCorrect) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return res.json({
            message: "Login realizado com sucesso.",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const me = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, active, created_at FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        return res.json({ user: result.rows[0] });
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Informe a senha atual e a nova senha." });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({ message: "A nova senha deve ter pelo menos 8 caracteres." });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "A nova senha deve ser diferente da senha atual." });
        }

        const result = await pool.query(
            "SELECT id, password_hash FROM users WHERE id = $1 AND active = TRUE",
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado ou conta desativada." });
        }
        const user = result.rows[0];
        const passwordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordCorrect) {
            return res.status(400).json({ message: "A senha atual está incorreta." });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, user.id]);
        return res.json({ message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        return res.status(500).json({ message: "Erro interno ao alterar a senha." });
    }
};

module.exports = { register, login, me, changePassword };
