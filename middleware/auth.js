const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'دسترسی غیرمجاز: توکن یافت نشد' });
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;

        next();
    } catch (error) {
        res.status(401).json({ message: 'توکن نامعتبر است' });
    }
};

module.exports = auth;
