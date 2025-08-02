import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Expense from '../models/Expense.js';
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

    // Build filter
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    // Monthly and weekly totals
    const [monthlyTotal, weeklyTotal, categoryStats, monthlyTrend, topExpenses] = await Promise.all([
      // Monthly total
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Weekly total
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Category breakdown
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Monthly trend (last 6 months)
      Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Top 3 highest expenses this month
      Expense.find({ userId, date: { $gte: startOfMonth } })
        .sort({ amount: -1 })
        .limit(3)
        .select('title amount category date')
    ]);

    res.json({
      monthlyTotal: monthlyTotal[0]?.total || 0,
      weeklyTotal: weeklyTotal[0]?.total || 0,
      categoryStats,
      monthlyTrend,
      topExpenses: topExpenses || []
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// Get budget progress
router.get('/budget-progress', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyTotal, user] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      req.user.populate ? req.user : await mongoose.model('User').findById(userId)
    ]);

    const spent = monthlyTotal[0]?.total || 0;
    const budget = user.monthlyBudget || 0;
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

    const expense = new Expense({
      title,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      note: note || '',
      userId: req.user._id
    });

    await expense.save();
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
    const updates = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

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

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });

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
