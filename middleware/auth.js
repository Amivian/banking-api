const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({ error: 'No authorization header provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).send({ error: 'No token provided.' });
        }

        // Properly verify JWT token using the secret
        const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-testing';
        const decoded = jwt.verify(token, secret);
        
        // Find user by ID from decoded token
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).send({ error: 'User not found.' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth;
