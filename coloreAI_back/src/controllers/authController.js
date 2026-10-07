const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verifica se todos os campos foram enviados
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Nome, email e senha são obrigatórios."
            });
        }

        // Verifica se o email já está cadastrado
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                message: "Este email já está cadastrado."
            });
        }

        // Criptografa a senha
        const passwordHash = await bcrypt.hash(password, 10);

        // Cria o usuário
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, active, created_at`,
            [name, email, passwordHash]
        );

        const user = result.rows[0];

        return res.status(201).json({
            message: "Usuário criado com sucesso.",
            user
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email e senha são obrigatórios."
            });
        }

        // Procura o usuário pelo email
        const result = await pool.query(
            `SELECT id, name, email, password_hash, role, active
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email ou senha inválidos."
            });
        }

        const user = result.rows[0];

        // Verifica se a conta está ativa
        if (!user.active) {
            return res.status(403).json({
                message: "Esta conta está desativada."
            });
        }

        // Compara a senha informada com o hash salvo
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Email ou senha inválidos."
            });
        }

        // Cria o JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.json({
            message: "Login realizado com sucesso.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


const me = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, active, created_at
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Usuário não encontrado."
            });
        }

        return res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);

        return res.status(500).json({
            message: "Erro interno do servidor."
        });
    }
};


module.exports = {
    register,
    login,
    me
};