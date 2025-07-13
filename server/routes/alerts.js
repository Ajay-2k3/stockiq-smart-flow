const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, severity, read, resolved } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (read !== undefined) query.isRead = read === 'true';
    if (resolved !== undefined) query.isResolved = resolved === 'true';

    const alerts = await Alert.find(query)
      .populate('relatedItem', 'name sku')
      .populate('relatedSupplier', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all alerts as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Alert.updateMany(
      { isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get alert statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Alert.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          unresolved: { $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || { total: 0, unread: 0, unresolved: 0, critical: 0, high: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create alert
router.post('/',
  [
    body('type').isIn(['low-stock', 'out-of-stock', 'reorder', 'system']).withMessage('Valid alert type is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid severity is required')
  ],
  auth,
  authorize('admin', 'manager'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const alert = new Alert(req.body);
      await alert.save();

      await alert.populate('relatedItem', 'name sku');
      await alert.populate('relatedSupplier', 'name');

      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Mark alert as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resolve alert
router.patch('/:id/resolve', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        isResolved: true, 
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('resolvedBy', 'name');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete alert
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;