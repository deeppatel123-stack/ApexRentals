import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_12345', {
    expiresIn: '7d',
  });
};

/**
 * Register a new Portal User / Customer
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'customer',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          tier: user.tier,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (Customer or Admin)
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ status: 'fail', message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: 'fail', message: 'Account is deactivated. Contact administrator.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          tier: user.tier,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatarUrl, addresses } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List customers (Admin only)
 * GET /api/v1/users/admin/customers
 */
export const listCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: customers.length,
      data: { customers },
    });
  } catch (error) {
    next(error);
  }
};
