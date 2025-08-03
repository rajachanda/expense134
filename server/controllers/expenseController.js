import { supabase } from '../server.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// Helper to get current month's start and end dates
const getCurrentMonthDateRange = () => {
  const now = new Date();
  return {
    startDate: startOfMonth(now).toISOString(),
    endDate: endOfMonth(now).toISOString(),
  };
};

// GET /api/expenses
export const getExpenses = async (req, res) => {
  const { sortBy = 'date', sortOrder = 'desc', limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { data: expenses, error, count } = await supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      expenses,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

// GET /api/expenses/:id
export const getExpenseById = async (req, res) => {
  try {
    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expense', error: error.message });
  }
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  const { title, amount, category, date, note } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const { data: newExpense, error } = await supabase
      .from('expenses')
      .insert([{ user_id: req.user.id, title, amount, category, date, note }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  const { title, amount, category, date, note } = req.body;

  try {
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update({ title, amount, category, date, note })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

// GET /api/expenses/stats
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = getCurrentMonthDateRange();
    const now = new Date();
    const weekStartDate = startOfWeek(now).toISOString();
    const weekEndDate = endOfWeek(now).toISOString();

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const monthlyTotal = expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .reduce((sum, e) => sum + e.amount, 0);

    const weeklyTotal = expenses
      .filter(e => e.date >= weekStartDate && e.date <= weekEndDate)
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryStats = expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .reduce((acc, e) => {
        const existing = acc.find(item => item._id === e.category);
        if (existing) {
          existing.total += e.amount;
        } else {
          acc.push({ _id: e.category, total: e.amount });
        }
        return acc;
      }, []);

    const topExpenses = expenses
      .filter(e => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Mock monthly trend for now
    const monthlyTrend = [
        { _id: { month: new Date().getMonth(), year: new Date().getFullYear() -1 }, total: Math.random() * 1000 },
        { _id: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }, total: monthlyTotal },
    ];

    res.json({
      monthlyTotal,
      weeklyTotal,
      categoryStats,
      monthlyTrend,
      topExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

// GET /api/expenses/budget-progress
export const getBudgetProgress = async (req, res) => {
    try {
        const { startDate, endDate } = getCurrentMonthDateRange();
        const budget = req.user.monthly_budget || 0;

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', req.user.id)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget - spent;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;

        res.json({
            spent,
            budget,
            remaining,
            percentage
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch budget progress', error: error.message });
    }
};
