import { supabase } from '../server.js';

export class Expense {
  static async create({ title, amount, category, date, note, userId }) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          title: title.trim(),
          amount: parseFloat(amount),
          category,
          date: date || new Date().toISOString().split('T')[0],
          note: note || '',
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findWithFilters({ userId, page = 1, limit = 10, category, search, startDate, endDate, sortBy = 'date', sortOrder = 'desc' }) {
    try {
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (category) query = query.eq('category', category);
      if (search) {
        query = query.or(`title.ilike.%${search}%,note.ilike.%${search}%`);
      }
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        expenses: data || [],
        total: count || 0
      };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id, userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id, userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyTotal(userId, startDate) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', startDate);

      if (error) throw error;

      const total = data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      return total;
    } catch (error) {
      throw error;
    }
  }

  static async getCategoryStats(userId) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {};
      data?.forEach(expense => {
        if (!stats[expense.category]) {
          stats[expense.category] = { total: 0, count: 0 };
        }
        stats[expense.category].total += expense.amount;
        stats[expense.category].count += 1;
      });

      return Object.entries(stats).map(([category, data]) => ({
        _id: category,
        total: data.total,
        count: data.count
      })).sort((a, b) => b.total - a.total);
    } catch (error) {
      throw error;
    }
  }
}

export default Expense;
