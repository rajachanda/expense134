import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Apply API rate limiting
router.use(apiLimiter);

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('monthlyBudget').optional().isFloat({ min: 0 }).withMessage('Monthly budget must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, monthlyBudget } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name) updates.name = name;
    if (monthlyBudget !== undefined) updates.monthly_budget = monthlyBudget;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, name, monthly_budget, created_at, updated_at')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ message: 'Error updating profile' });
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

export default router;
