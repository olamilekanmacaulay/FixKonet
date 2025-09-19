const User = require("../models/user.model");

// Middleware to check if user is authenticated via session
const requireAuth = (req, res, next) => {
    try {
        // Check if session exists and has user data
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login first."
            });
        }

        // Check if session user has required fields
        if (!req.session.user.id || !req.session.user.phoneNumber) {
            return res.status(401).json({
                success: false,
                message: "Invalid session. Please login again."
            });
        }

        // Attach user info to request object for use in controllers
        req.user = req.session.user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: "Authentication error. Please try again."
        });
    }
};

module.exports = { requireAuth };

