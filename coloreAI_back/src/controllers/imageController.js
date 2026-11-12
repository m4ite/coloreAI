const crypto = require("crypto");
const pool = require("../config/database");
const supabase = require("../config/supabase");

const BUCKET = process.env.SUPABASE_BUCKET || "images";
const EXT = { "image/jpeg": "jpg", "image/png": "png" };

const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Nenhuma imagem enviada." });
        }

        const ext = EXT[file.mimetype];
        if (!ext) {
            return res.status(400).json({ message: "Formato inválido. Use JPG ou PNG." });
        }

        // pasta por usuário + nome aleatório (evita colisão e nomes com caracteres estranhos)
        const storagePath = `${req.user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (uploadError) {
            console.error("Erro no Supabase Storage:", uploadError);
            return res.status(502).json({ message: "Falha ao salvar a imagem." });
        }

        const result = await pool.query(
            `INSERT INTO images (user_id, storage_path, original_name, mime_type, size_bytes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, storage_path, original_name, created_at`,
            [req.user.id, storagePath, file.originalname, file.mimetype, file.size],
        );

        // bucket privado: devolve URL assinada (1h) para o front exibir
        const { data: signed } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(storagePath, 60 * 60);

        return res.status(201).json({
            message: "Imagem enviada com sucesso.",
            image: { ...result.rows[0], url: signed?.signedUrl ?? null },
        });
    } catch (error) {
        console.error("Erro no upload:", error);
        return res.status(500).json({ message: "Erro interno do servidor." });
    }
};

module.exports = { uploadImage };