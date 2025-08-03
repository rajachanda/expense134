import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { supabase } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Apply API rate limiting
router.use(apiLimiter);

// Get all expenses with filtering, sorting, and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other']),
  query('sortBy').optional().isIn(['date', 'amount', 'title']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const result = await Expense.findWithFilters({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    res.json({
      expenses: result.expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
});

// Get expense statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];

    const [monthlyTotal, weeklyTotal, categoryStats] = await Promise.all([
      Expense.getMonthlyTotal(userId, startOfMonth),
      Expense.getMonthlyTotal(userId, startOfWeek),
      Expense.getCategoryStats(userId)
    ]);

    res.json({
      monthlyTotal,
      weeklyTotal,
      categoryStats,
      monthlyTrend: [],
      topExpenses: []
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get budget progress
router.get('/budget-progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const [monthlyTotal, user] = await Promise.all([
      Expense.getMonthlyTotal(userId, startOfMonth),
      User.findById(userId)
    ]);

    const spent = monthlyTotal || 0;
    const budget = user?.monthly_budget || 0;
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

    res.json({
      spent,
      budget,
      remaining: Math.max(budget - spent, 0),
      percentage: Math.round(percentage)
    });
  } catch (error) {
    console.error('Get budget progress error:', error);
    res.status(500).json({ message: 'Server error fetching budget progress' });
  }
});

// Create expense
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isIn(['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other']).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('note').optional().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount, category, date, note } = req.body;

    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date).toISOString().split('T')[0] : undefined,
      note: note || '',
      userId: req.user.id
    });

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
});

// Update expense
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').optional().isIn(['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other']).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('note').optional().isLength({ max: 500 }).withMessage('Note must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body };
    
    // Convert note to description for Supabase
    if (updates.note !== undefined) {
      updates.description = updates.note;
      delete updates.note;
    }

    const expense = await Expense.updateById(id, req.user.id, updates);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.deleteById(id, req.user.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
});

export default router;
