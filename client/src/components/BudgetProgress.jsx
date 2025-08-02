import { AlertTriangle, TrendingUp } from 'lucide-react';

const BudgetProgress = ({ spent = 0, budget = 0 }) => {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget && budget > 0;
  const remaining = Math.max(budget - spent, 0);

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    if (percentage > 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600 dark:text-red-400';
    if (percentage > 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Monthly Budget
        </h3>
        {isOverBudget && (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
      </div>

      {budget > 0 ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Spent: ${spent.toFixed(2)}</span>
              <span>Budget: ${budget.toFixed(2)}</span>
            </div>
            
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getProgressColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            
            {isOverBudget && percentage > 100 && (
              <div className="mt-1 bg-red-100 dark:bg-red-900 rounded-full h-1">
                <div 
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${Math.min((percentage - 100), 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className={`text-lg font-semibold ${getStatusColor()}`}>
                {isOverBudget ? '+' : ''}${Math.abs(remaining).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Used
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No budget set
          </p>
          <p className="text-sm text-gray-400">
            Set a monthly budget in your profile to track spending
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
