import api from './api';

// Add delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getExpenses = async (params = {}) => {
  await delay(50); // Small delay to prevent rapid requests
  return api.get('/expenses', { params });
};

export const getExpenseStats = async () => {
  await delay(100); // Slightly longer delay for stats
  return api.get('/expenses/stats');
};

export const getBudgetProgress = async () => {
  await delay(100);
  return api.get('/expenses/budget-progress');
};

export const createExpense = async (expenseData) => {
  await delay(50);
  return api.post('/expenses', expenseData);
};

export const updateExpense = async (id, expenseData) => {
  await delay(50);
  return api.put(`/expenses/${id}`, expenseData);
};

export const deleteExpense = async (id) => {
  await delay(50);
  return api.delete(`/expenses/${id}`);
};

export const getExpenseById = (id) => {
  return api.get(`/expenses/${id}`);
};
