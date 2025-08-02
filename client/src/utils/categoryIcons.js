export const categoryIcons = {
  'Food': '🍔',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Bills': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Travel': '✈️',
  'Personal Care': '💄',
  'Other': '📦'
};

export const getCategoryIcon = (category) => {
  return categoryIcons[category] || '📦';
};

export const getCategoryColor = (category) => {
  const colors = {
    'Food': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Shopping': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'Bills': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Travel': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Personal Care': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

export const categories = [
  'Food',
  'Transportation', 
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other'
];
