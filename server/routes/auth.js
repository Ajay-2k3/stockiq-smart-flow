const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register (Admin only creates users)
router.post('/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'staff']).withMessage('Valid role is required')
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Only admin can create users
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only administrators can create users' });
      }

      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        name,
        email,
        password,
        role,
        createdBy: req.user._id
      });

      await user.save();
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      console.log(`🔐 Login attempt for email: ${email}`);
      console.log(`📥 Submitted password: "${password}"`);

      const user = await User.findOne({ email });
      if (!user) {
        console.log('❌ No user found with email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        console.log('⚠️ User account is inactive:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ User found:', user.email, '| role:', user.role);

      const isMatch = await user.comparePassword(password);
      console.log(`🔍 Password match for ${email}: ${isMatch}`);

      if (!isMatch) {
        console.log('❌ Password does not match for:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      console.log(`✅ JWT issued for user: ${email}`);
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('🔥 Server error during login:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);


// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;