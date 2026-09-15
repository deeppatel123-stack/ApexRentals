import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: Validates Bearer token in Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_12345');

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          status: 'fail',
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired authorization token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No authorization token provided.',
    });
  }
};

/**
 * Restrict to Admin only.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden. Admin privileges are required to access this resource.',
    });
  }
  next();
};

/**
 * Restrict to Customer only.
 */
export const requireCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({
      status: 'fail',
      message: 'Forbidden. Customer portal access required.',
    });
  }
  next();
};
