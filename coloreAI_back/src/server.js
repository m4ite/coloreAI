const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend do ColorizeAI funcionando!"
    });
});

app.use("/api/auth", authRoutes);

const PORT = 3000;

app.get("/teste-banco", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Banco conectado!",
            horario: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erro ao conectar com o banco."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

