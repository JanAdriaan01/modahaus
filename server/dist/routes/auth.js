"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
// Change to export a function that accepts db
exports.default = (db) => {
    const router = (0, express_1.Router)();
    // Generate JWT token
    const generateToken = (user) => {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
    };
    // Register new user
    router.post('/register', [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
        (0, express_validator_1.body)('password').isLength({ min: 6 }),
        (0, express_validator_1.body)('firstName').trim().notEmpty(),
        (0, express_validator_1.body)('lastName').trim().notEmpty()
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, firstName, lastName, phone } = req.body;
        // Check if user already exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const result = await db.run('INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)', [email, passwordHash, firstName, lastName, phone || null]);
        const userId = result.lastID;
        // Generate token
        const token = generateToken({
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            is_admin: 0
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName
            }
        });
    }));
    // Login user
    router.post('/login', [
        (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
        (0, express_validator_1.body)('password').notEmpty()
    ], (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        // Get user
        const user = await db.get('SELECT id, email, password_hash, first_name, last_name, is_admin FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Check password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate token
        const token = generateToken(user);
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin
            }
        });
    }));
    // Get current user profile
    router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied' });
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            const user = await db.get('SELECT id, email, first_name, last_name, phone, is_admin, created_at FROM users WHERE id = ?', [decoded.id]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    isAdmin: user.is_admin,
                    createdAt: user.created_at
                }
            });
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }));
    // Refresh token
    router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied' });
        }
        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            // Get fresh user data
            const user = await db.get('SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = ?', [decoded.id]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Generate new token
            const newToken = generateToken(user);
            res.json({
                success: true,
                token: newToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    isAdmin: user.is_admin
                }
            });
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }));
    return router;
};
//# sourceMappingURL=auth.js.map