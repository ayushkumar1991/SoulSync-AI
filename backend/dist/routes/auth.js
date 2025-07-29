"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /auth/register
router.post("/register", authController_1.register);
// POST /auth/login
router.post("/login", authController_1.login);
// POST /auth/logout
router.post("/logout", auth_1.auth, authController_1.logout);
// GET /auth/me
router.get("/me", auth_1.auth, (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
