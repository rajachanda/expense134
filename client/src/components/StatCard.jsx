import { useState, useEffect } from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  prefix = '', 
  suffix = '',
  trend = null,
  animate = true 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const numericValue = parseFloat(value) || 0;
    let start = 0;
    const duration = 1000;
    const increment = numericValue / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, animate]);

  const colorClasses = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900',
      trend: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900',
      trend: 'text-green-600 dark:text-green-400'
    },
    red: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900',
      trend: 'text-red-600 dark:text-red-400'
    },
    yellow: {
      icon: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      trend: 'text-yellow-600 dark:text-yellow-400'
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
    return val;
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}{formatValue(displayValue)}{suffix}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${colorClasses[color]?.trend || 'text-gray-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]?.bg || 'bg-gray-100'} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${colorClasses[color]?.icon || 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
