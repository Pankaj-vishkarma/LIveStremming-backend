// src/middleware/role.middleware.js

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // User not attached (authMiddleware missing)
            if (!req.user && !req.admin) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            // 🔍 Role detect
            const role = req.user?.role || req.admin?.role || "user";

            // Role not allowed
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Access denied",
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Role check failed",
            });
        }
    };
};

module.exports = {
    roleMiddleware,
};