const jwt = require("jsonwebtoken");

const chewckAuth = (requiredRole) => {
    
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual secret key

            console.log(decoded.role);

            if (requiredRole && decoded.role !== requiredRole) {
                return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            }

            req.user = decoded; // Store user info in request object
            next(); // Move to the next middleware or controller
        } catch (error) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    };
};

module.exports = chewckAuth;
