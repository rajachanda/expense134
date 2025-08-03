import express from 'express';
import { body, query } from 'express-validator';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getBudgetProgress,
} from '../controllers/expenseController.js';

const router = express.Router();

// All expense routes are protected
router.use(authMiddleware);

// Get all expenses with filtering, sorting, and pagination
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isString(),
    query('sortBy').optional().isIn(['date', 'amount', 'title']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  getExpenses
);

// Get expense statistics
router.get('/stats', getExpenseStats);

// Get budget progress
router.get('/budget-progress', getBudgetProgress);

// Get expense by ID
router.get('/:id', getExpenseById);

// Create expense
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title is required and must be less than 100 characters'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .isIn([
        'Food',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Bills',
        'Healthcare',
        'Education',
        'Travel',
        'Personal Care',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('note')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Note must be less than 500 characters'),
  ],
  createExpense
);

// Update expense
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be less than 100 characters'),
    body('amount')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .optional()
      .isIn([
        'Food',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Bills',
        'Healthcare',
        'Education',
        'Travel',
        'Personal Care',
        'Other',
      ])
      .withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('note')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Note must be less than 500 characters'),
  ],
  updateExpense
);

// Delete expense
router.delete('/:id', deleteExpense);

export default router;
