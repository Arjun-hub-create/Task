const User = require('../models/User');
const { generateTokens, generateAccessToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @POST /api/v1/auth/signup
const signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already in use.` });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role === 'manager' ? 'manager' : 'user',
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated.' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/v1/auth/logout
const logout = async (req, res) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @POST /api/v1/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const accessToken = generateAccessToken(user._id);

    res.json({ success: true, accessToken });
  } catch (error) {
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
};

// @GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      avatarColor: req.user.avatarColor,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { signup, login, logout, refresh, getMe };
