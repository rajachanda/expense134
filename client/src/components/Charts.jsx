import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

export const MonthlyTrendChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'Monthly Spending',
        data: data.map(item => item.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export const CategoryPieChart = ({ data = [] }) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        data: data.map(item => item.total),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="chart-container">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export const WeeklySpendChart = ({ expenses = [] }) => {
  const getWeeklyData = () => {
    const now = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      weekData.push({
        day: dayName,
        total
      });
    }
    
    return weekData;
  };

  const weeklyData = getWeeklyData();

  const chartData = {
    labels: weeklyData.map(item => item.day),
    datasets: [
      {
        label: 'Daily Spending',
        data: weeklyData.map(item => item.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};
