import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, handleSupabaseError } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// --- Registration ---
router.post(
  '/register',
  apiLimiter,
  [
    body('name', 'Name is required').not().isEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ name, email, password: hashedPassword })
        .select('id, name, email, created_at')
        .single();

      if (error) {
        const { message, status } = handleSupabaseError(error);
        return res.status(status).json({ message });
      }

      // Create JWT
      const payload = { user: { id: newUser.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(201).json({ token, user: newUser });
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// --- Login ---
router.post(
  '/login',
  apiLimiter,
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user in Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT
      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      
      delete user.password; // Don't send password back
      res.json({ token, user });

    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// --- Get Current User ---
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, monthly_budget, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
