import jwt from 'jsonwebtoken';
import { supabase } from '../server.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    // Attach user to the request object (excluding password)
    delete user.password;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
