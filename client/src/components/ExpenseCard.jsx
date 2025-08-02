import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';
import { format } from 'date-fns';

const ExpenseCard = ({ expense, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(expense._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 relative">
      {/* Menu Button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <MoreVertical size={16} className="text-gray-500" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
            <Link
              to={`/edit-expense/${expense._id}`}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowMenu(false)}
            >
              <Edit size={14} />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1 pr-8">
          {/* Category Badge */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getCategoryIcon(expense.category)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
            {expense.title}
          </h3>

          {/* Note */}
          {expense.note && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {expense.note}
            </p>
          )}

          {/* Date */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(expense.date), 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${expense.amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
