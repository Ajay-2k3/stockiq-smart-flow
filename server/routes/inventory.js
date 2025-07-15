/* ---------------------------------------------------------------------- */
/*  routes/inventory.js                                                   */
/* ---------------------------------------------------------------------- */
const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* ====================================================================== */
/*  GET /api/inventory  – list with filters & pagination                  */
/* ====================================================================== */
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
    } = req.query;

    const query = {};

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { sku:         { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Inventory.find(query)
      .populate('supplier',  'name contactPerson')
      .populate('updatedBy', 'name')
      .sort({ updatedAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await Inventory.countDocuments(query);

    return res.json({
      inventory: items,
      pagination: {
        currentPage: +page,
        totalPages:  Math.ceil(total / +limit),
        totalItems:  total,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  GET /api/inventory/:id  – single item                                 */
/* ====================================================================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('supplier',  'name contactPerson')
      .populate('updatedBy', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  POST /api/inventory  – create                                         */
/* ====================================================================== */
router.post(
  '/',
  auth,
  authorize('admin', 'manager'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('reorderLevel').isNumeric().withMessage('Re‑order level must be a number'),
    body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
    body('supplier').notEmpty().withMessage('Supplier is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const item = await Inventory.create({
        ...req.body,
        updatedBy: req.user._id,
      });

      await checkAndCreateAlert(item);

      const populated = await Inventory.findById(item._id)
        .populate('supplier',  'name contactPerson')
        .populate('updatedBy', 'name');

      return res.status(201).json(populated);
    } catch (err) {
      /* duplicate key → 409 Conflict */
      if (err.code === 11000 && err.keyPattern?.sku) {
        return res.status(409).json({ message: 'SKU already exists' });
      }
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ====================================================================== */
/*  PUT /api/inventory/:id  – update                                      */
/* ====================================================================== */
router.put(
  '/:id',
  auth,
  authorize('admin', 'manager', 'staff'),
  [
    body('name').optional().notEmpty(),
    body('quantity').optional().isNumeric(),
    body('reorderLevel').optional().isNumeric(),
    body('unitPrice').optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    /* Staff can only modify quantity */
    if (
      req.user.role === 'staff' &&
      Object.keys(req.body).some((k) => k !== 'quantity')
    ) {
      return res
        .status(403)
        .json({ message: 'Staff can only update quantity' });
    }

    try {
      const updated = await Inventory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user._id, lastUpdated: new Date() },
        { new: true, runValidators: true }
      )
        .populate('supplier',  'name contactPerson')
        .populate('updatedBy', 'name');

      if (!updated) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      await checkAndCreateAlert(updated);

      return res.json(updated);
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.sku) {
        return res.status(409).json({ message: 'SKU already exists' });
      }
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ====================================================================== */
/*  DELETE /api/inventory/:id  – remove                                   */
/* ====================================================================== */
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    return res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  Helper: auto‑create low/out‑of‑stock alerts                           */
/* ====================================================================== */
async function checkAndCreateAlert(item) {
  if (item.quantity > item.reorderLevel) return; // nothing to do

  const type      = item.quantity === 0 ? 'out-of-stock' : 'low-stock';
  const severity  = item.quantity === 0 ? 'critical'     : 'high';

  const exists = await Alert.findOne({
    type,
    relatedItem: item._id,
    isResolved: false,
  });

  if (!exists) {
    await Alert.create({
      type,
      severity,
      relatedItem: item._id,
      title:   type === 'out-of-stock' ? 'Out of Stock Alert' : 'Low Stock Alert',
      message: `${item.name} (${item.sku}) is ${type === 'out-of-stock'
        ? 'out of stock'
        : `running low (${item.quantity} left)`}`,
    });
  }
}

module.exports = router;
