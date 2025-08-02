import { useState, useEffect, useMemo } from 'react';
import * as expenseService from '../services/expenseService';
import { toast } from 'react-hot-toast';

export const useExpenses = (filters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch expenses first
      const expensesResponse = await expenseService.getExpenses(filters);
      setExpenses(expensesResponse.data.expenses || []);
      
      // Add delay before fetching stats to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const statsResponse = await expenseService.getExpenseStats();
      setStats(statsResponse.data);
    } catch (err) {
      setError(err.message);
      if (err.response?.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment before trying again.');
      } else {
        toast.error('Failed to fetch expenses');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [JSON.stringify(filters)]);

  const analytics = useMemo(() => {
    if (!expenses.length || !stats) {
      return {
        monthlyTotal: 0,
        weeklyTotal: 0,
        dailyAverage: 0,
        topExpenses: [],
        categoryBreakdown: [],
        monthlyTrend: []
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate monthly total
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate weekly total
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= weekStart;
    });
    
    const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate daily average
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyAverage = monthlyTotal / daysInMonth;
    
    // Get top 3 expenses
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    return {
      monthlyTotal,
      weeklyTotal,
      dailyAverage,
      topExpenses,
      categoryBreakdown: stats.categoryStats || [],
      monthlyTrend: stats.monthlyTrend || []
    };
  }, [expenses, stats]);

  const deleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense._id !== id));
      toast.success('Expense deleted successfully');
      
      // Add delay before refetching stats
      await new Promise(resolve => setTimeout(resolve, 200));
      const statsResponse = await expenseService.getExpenseStats();
      setStats(statsResponse.data);
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('Rate limit exceeded. Changes saved but stats may be outdated.');
      } else {
        toast.error('Failed to delete expense');
      }
    }
  };

  return {
    expenses,
    stats,
    analytics,
    loading,
    error,
    refetch: fetchExpenses,
    deleteExpense
  };
};
