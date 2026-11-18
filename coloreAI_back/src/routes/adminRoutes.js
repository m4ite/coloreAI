const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/requireAdmin");
const {
    listUsers,
    updateUserRole,
    updateUserStatus,
    getStats,
    listLogs,
    listColorizations,
} = require("../controllers/adminController");

const router = express.Router();

// Todas as rotas abaixo exigem token válido + papel admin.
router.use(authMiddleware, requireAdmin);

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.get("/stats", getStats);
router.get("/logs", listLogs);
router.get("/colorizations", listColorizations);

module.exports = router;
