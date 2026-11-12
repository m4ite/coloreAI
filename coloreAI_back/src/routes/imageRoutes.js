const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadImage } = require("../controllers/imageController");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB, igual ao front
    fileFilter: (req, file, cb) => {
        if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
        else cb(new Error("INVALID_FORMAT"));
    },
});

router.post("/upload", authMiddleware, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err?.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "Arquivo maior que 10 MB." });
        }
        if (err) {
            return res.status(400).json({ message: "Formato inválido. Use JPG ou PNG." });
        }
        next();
    });
}, uploadImage);

module.exports = router;