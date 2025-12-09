const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, "RAHASIA_TOKEN");
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
};
