import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { getExpenses, getExpenseStats, getBudgetProgress, deleteExpense } from '../services/expenseService';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';
import { format } from 'date-fns';
import { StatsCard, BudgetCard, TopExpensesCard } from '../components/AnalyticsCards';
import { MonthlyTrendChart, CategoryPieChart, WeeklySpendChart } from '../components/Charts';
import { CardSkeleton, ExpenseItemSkeleton, ChartSkeleton } from '../components/SkeletonLoader';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    monthlyTotal: 0,
    weeklyTotal: 0,
    categoryStats: [],
    monthlyTrend: [],
    topExpenses: []
  });
  const [budgetData, setBudgetData] = useState({
    spent: 0,
    budget: 0,
    remaining: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data sequentially to avoid rate limiting
      const expensesResponse = await getExpenses({ limit: 5, sortBy: 'date', sortOrder: 'desc' });
      setExpenses(expensesResponse.data.expenses || []);
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const statsResponse = await getExpenseStats();
      setStats(statsResponse.data || {});
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const budgetResponse = await getBudgetProgress();
      setBudgetData(budgetResponse.data || {});
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.status === 429 ? 'Rate limit exceeded. Please refresh the page in a moment.' : 'Failed to load dashboard data');
      
      if (error.response?.status !== 429) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      toast.success('Expense deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const calculateAverageDaily = useCallback(() => {
    const daysInMonth = new Date().getDate();
    return (stats.monthlyTotal / daysInMonth).toFixed(2);
  }, [stats.monthlyTotal]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {error}
          </h2>
          <button
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link
          to="/add-expense"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="This Month"
          value={`$${stats.monthlyTotal.toFixed(2)}`}
          icon={Calendar}
          color="text-blue-600 dark:text-blue-400"
          index={0}
        />
        <StatsCard
          title="This Week"
          value={`$${stats.weeklyTotal.toFixed(2)}`}
          icon={TrendingUp}
          color="text-green-600 dark:text-green-400"
          index={1}
        />
        <StatsCard
          title="Avg. Daily"
          value={`$${calculateAverageDaily()}`}
          icon={DollarSign}
          color="text-purple-600 dark:text-purple-400"
          index={2}
        />
        <BudgetCard budgetData={budgetData} index={3} />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopExpensesCard expenses={stats.topExpenses} index={4} />
        
        {/* Charts */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Breakdown
          </h3>
          {stats.categoryStats?.length > 0 ? (
            <CategoryPieChart data={stats.categoryStats} />
          ) : (
            <ChartSkeleton />
          )}
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Trend
          </h3>
          {stats.monthlyTrend?.length > 0 ? (
            <MonthlyTrendChart data={stats.monthlyTrend} />
          ) : (
            <ChartSkeleton />
          )}
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Spending
          </h3>
          <WeeklySpendChart expenses={expenses} />
        </motion.div>
      </div>

      {/* Recent Expenses */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Expenses</h2>
          <Link to="/expenses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{expense.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-semibold text-gray-900 dark:text-white">${expense.amount.toFixed(2)}</p>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/edit-expense/${expense._id}`}
                      className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No expenses yet</p>
            <Link
              to="/add-expense"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Your First Expense</span>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
