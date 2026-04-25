import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Token header se lena
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token extract karna
      token = req.headers.authorization.split(' ')[1];

      // Token verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko request mein add karna
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };