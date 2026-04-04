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

            // Detect user role
            const role = req.user?.role || req.admin?.role || "user";

            // Role not allowed
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Access denied",
                });
            }

            next();
        } catch {
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