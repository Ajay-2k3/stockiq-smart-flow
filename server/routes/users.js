const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* ==================================================================== */
/*  POST /api/users  – Create user (admin only)                         */
/* ==================================================================== */
router.post(
  '/',
  auth,
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid e‑mail is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'manager', 'staff']).withMessage('Role must be admin, manager, or staff'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'A user with that e‑mail already exists' });
    }

    try {
      const user = await User.create({ ...req.body, createdBy: req.user.id });
      const { password, ...safeUser } = user.toObject();
      return res.status(201).json(safeUser);
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ==================================================================== */
/*  DELETE /api/users/:id  – Remove user (admin only)                   */
/* ==================================================================== */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ==================================================================== */
/*  GET /api/users  – List users (admin only)                           */
/* ==================================================================== */
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active } = req.query;

    const query = {};
    if (role) query.role = role;
    if (active !== undefined) query.isActive = active === 'true';

    /* grand‑total (no paging) */
    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')                // hide password hash
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    return res.json({
      totalUsers,                         // << NEW
      users,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(totalUsers / +limit),
        totalItems: totalUsers,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ==================================================================== */
/*  GET /api/users/:id  – Single user (admin)                           */
/* ==================================================================== */
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('createdBy', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ==================================================================== */
/*  PUT /api/users/:id  – Update user (admin)                           */
/* ==================================================================== */
router.put(
  '/:id',
  auth,
  authorize('admin'),
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['admin', 'manager', 'staff']),
    body('password').optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      Object.assign(user, req.body);
      await user.save();
      await user.populate('createdBy', 'name');

      const { password, ...safe } = user.toObject();
      return res.json(safe);
    } catch (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ==================================================================== */
/*  PATCH /api/users/:id/activate | deactivate                           */
/* ==================================================================== */
router.patch('/:id/deactivate', auth, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ message: 'User deactivated successfully', user });
});

router.patch('/:id/activate', auth, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ message: 'User activated successfully', user });
});

module.exports = router;
