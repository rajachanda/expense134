import bcrypt from 'bcryptjs';
import { supabase } from '../server.js';

export class User {
  static async create({ name, email, password, monthlyBudget = 0 }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          monthly_budget: monthlyBudget
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static removePassword(user) {
    if (!user) return user;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default User;
