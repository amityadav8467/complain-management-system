const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/email');

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || 5);

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, phone, address, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const pendingUser = await User.findOne({ email: normalizedEmail }).select(
      '+otp.codeHash +otp.expiresAt'
    );
    if (!pendingUser) {
      return res.status(400).json({ success: false, message: 'Please request OTP first' });
    }

    if (pendingUser.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (!pendingUser.otp?.codeHash || !pendingUser.otp?.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new OTP' });
    }

    if (new Date(pendingUser.otp.expiresAt) < new Date()) {
      pendingUser.otp = undefined;
      await pendingUser.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP' });
    }

    if (hashOtp(String(otp)) !== pendingUser.otp.codeHash) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    pendingUser.name = name;
    pendingUser.password = password;
    pendingUser.phone = phone;
    pendingUser.address = address;
    pendingUser.emailVerified = true;
    pendingUser.isActive = true;
    pendingUser.otp = undefined;
    await pendingUser.save();

    const token = generateToken(pendingUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: pendingUser._id,
        name: pendingUser.name,
        email: pendingUser.email,
        role: pendingUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request registration OTP
// @route   POST /api/auth/register/request-otp
// @access  Public
exports.requestRegisterOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    let user = await User.findOne({ email: normalizedEmail }).select('+otp.codeHash +otp.expiresAt');
    if (user?.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    if (!user) {
      user = new User({
        email: normalizedEmail,
        isActive: false,
      });
    }

    user.otp = {
      codeHash: hashOtp(otp),
      expiresAt,
    };

    await user.save();
    try {
      await sendOtpEmail(normalizedEmail, otp, OTP_EXPIRE_MINUTES);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.json({
      success: true,
      message: `OTP sent to ${normalizedEmail}. It expires in ${OTP_EXPIRE_MINUTES} minutes.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.emailVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please complete registration with OTP',
      });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.emailVerified === false || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
