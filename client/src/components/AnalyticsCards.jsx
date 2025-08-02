import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export const StatsCard = ({ title, value, icon: Icon, color, index, change }) => (
  <motion.div
    className="card"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    custom={index}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last month
          </p>
        )}
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  </motion.div>
);

export const BudgetCard = ({ budgetData, index }) => {
  const { spent, budget, remaining, percentage } = budgetData;
  
  return (
    <motion.div
      className="card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Spent</span>
            <span className="font-medium">${spent.toFixed(2)}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                percentage > 90 ? 'bg-red-500' : 
                percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Budget: ${budget.toFixed(2)}</span>
            <span className={`font-medium ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remaining.toFixed(2)} remaining
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TopExpensesCard = ({ expenses, index }) => (
  <motion.div
    className="card"
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    custom={index}
    whileHover={{ scale: 1.02 }}
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Expenses</h3>
        <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      </div>
      
      <div className="space-y-3">
        {expenses.length > 0 ? expenses.map((expense, idx) => (
          <motion.div
            key={expense._id}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCategoryIcon(expense.category)}</span>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {expense.title}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              ${expense.amount.toFixed(2)}
            </span>
          </motion.div>
        )) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No expenses this month
          </p>
        )}
      </div>
    </div>
  </motion.div>
);
