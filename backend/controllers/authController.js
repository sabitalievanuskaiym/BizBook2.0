const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
  bonusBalance: user.bonusBalance,
  masterId: user.masterId,
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const tenantId = req.tenantId;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const allowedRoles = ['client'];
    const userRole = role && allowedRoles.includes(role) ? role : 'client';

    const existing = await User.findOne({ tenantId, email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered for this network.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      tenantId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      bonusBalance: 0,
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenantId;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ tenantId, email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.tenantId.toString() !== req.user.tenantId) {
      return res.status(403).json({ message: 'Tenant mismatch.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };
