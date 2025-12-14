import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Database } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../services/emailService';

// Change to export a function that accepts db
export default (db: Database) => {
  const router = Router();

// Generate JWT token
const generateToken = (user: any) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin
    },
    jwtSecret,
    { expiresIn: '30d' }
  );
};

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
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
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const result = await db.run(
    'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, lastName, phone || null]
  );

  const userId = result.lastID;

  // Send welcome email
  await sendEmail(
    email,
    'Welcome to Modahaus!',
    `<h1>Welcome, ${firstName}!</h1><p>Thank you for registering at Modahaus. We're excited to have you.</p>`
  );

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
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Get user
  const user = await db.get(
    'SELECT id, email, password_hash, first_name, last_name, is_admin FROM users WHERE email = ?',
    [email]
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
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
router.get('/profile', asyncHandler(async (req: AuthRequest, res: Response) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    const user = await db.get(
      'SELECT id, email, first_name, last_name, phone, is_admin, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

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
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: AuthRequest, res: Response) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied' });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Get fresh user data
    const user = await db.get(
      'SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = ?',
      [decoded.id]
    );

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
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}));

  return router;
};