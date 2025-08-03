import { supabase } from '../server.js';
import bcrypt from 'bcryptjs';

// User operations
export const UserDB = {
  async create(userData) {
    const { name, email, password, monthlyBudget = 0 } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          monthly_budget: monthlyBudget
        }
      ])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateById(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};

// Expense operations
export const ExpenseDB = {
  async create(expenseData) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async findByUserId(userId, filters = {}) {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortBy, sortOrder);

    // Apply pagination
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    
    if (error) throw new Error(error.message);
    return { data, count };
  },

  async findById(id, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updateById(id, userId, updates) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteById(id, userId) {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  },

  async getStats(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];

    // Get monthly total
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfMonth);

    if (monthlyError) throw new Error(monthlyError.message);

    // Get weekly total
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', startOfWeek);

    if (weeklyError) throw new Error(weeklyError.message);

    // Calculate totals
    const monthlyTotal = monthlyData.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const weeklyTotal = weeklyData.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    return {
      monthlyTotal,
      weeklyTotal
    };
  }
};
