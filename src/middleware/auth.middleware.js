// src/middleware/auth.middleware.js

const { verifyToken } = require("../utils/jwt");
const User = require("../modules/auth/auth.model");
const Admin = require("../modules/admin/admin.model");

const authMiddleware = async (req, res, next) => {
    try {
        // ==========================
        // ✅ ONLY COOKIE BASED TOKEN
        // ==========================
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided",
            });
        }

        // ==========================
        // ✅ VERIFY TOKEN (SAFE)
        // ==========================
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // ==========================
        // ✅ ADMIN FLOW
        // ==========================
        if (decoded.role === "super_admin" || decoded.role === "moderator") {
            const admin = await Admin.findById(decoded.id);

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "Admin not found",
                });
            }

            req.admin = admin;
            req.admin.role = admin.role;

            return next();
        }

        // ==========================
        // ✅ USER FLOW
        // ==========================
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        req.user.role = decoded.role || user.role || "user";

        return next();

    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }
};

module.exports = {
    authMiddleware,
};