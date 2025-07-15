const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* ====================================================================== */
/*  GET /api/inventory – list with filters, pagination & sort             */
/* ====================================================================== */
router.get('/', auth, async (req, res) => {
  try {
    const {
      page,
      limit = 10,
      category,
      search,
      sort = '-updatedAt',
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = {};
    sort
      .toString()
      .split(',')
      .forEach((f) => {
        f = f.trim();
        if (!f) return;
        sortObj[f.replace(/^-/, '')] = f.startsWith('-') ? -1 : 1;
      });

    const cursor = Inventory.find(query)
      .populate('supplier', 'name contactPerson')
      .populate('updatedBy', 'name')
      .sort(sortObj);

    if (page) {
      const p = +page;
      const l = +limit;
      cursor.skip((p - 1) * l).limit(l);
    } else {
      cursor.limit(+limit);
    }

    const [items, total] = await Promise.all([
      cursor.exec(),
      Inventory.countDocuments(query),
    ]);

    res.json({
      inventory: items,
      pagination: {
        currentPage: page ? +page : 1,
        totalPages: Math.ceil(total / +limit),
        totalItems: total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  GET /api/inventory/:id – single item                                  */
/* ====================================================================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('supplier', 'name contactPerson')
      .populate('updatedBy', 'name');

    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  POST /api/inventory – create a new inventory item                     */
/* ====================================================================== */
router.post(
  '/',
  auth,
  authorize('admin', 'manager','staff'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be numeric'),
    body('reorderLevel').isNumeric().withMessage('Re‑order level must be numeric'),
    body('price').optional().isNumeric().withMessage('Price must be numeric'),
    body('unitPrice').optional().isNumeric().withMessage('Unit price must be numeric'),
    body('supplier').notEmpty().withMessage('Supplier is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[POST /inventory] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // 🔄 Accept 'price' as alias for 'unitPrice'
    // 🔄 Normalize price and unitPrice
    if ('unitPrice' in req.body && !('price' in req.body)) {
      req.body.price = req.body.unitPrice;
    }
    if ('price' in req.body && !('unitPrice' in req.body)) {
      req.body.unitPrice = req.body.price;
    }


    console.log('[POST /inventory] Final body:', req.body);

    try {
      const item = await Inventory.create({
        ...req.body,
        updatedBy: req.user._id,
      });

      await checkAndCreateAlert(item);

      const populated = await Inventory.findById(item._id)
        .populate('supplier', 'name contactPerson')
        .populate('updatedBy', 'name');

      return res.status(201).json(populated);
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.sku) {
        return res.status(409).json({ message: 'SKU already exists' });
      }
      console.error('[POST /inventory] Server error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ====================================================================== */
/*  PUT /api/inventory/:id – update                                       */
/* ====================================================================== */
router.put(
  '/:id',
  auth,
  authorize('admin', 'manager', 'staff'),
  [
    body('name').optional().notEmpty(),
    body('quantity').optional().isNumeric(),
    body('reorderLevel').optional().isNumeric(),
    body('price').optional().isNumeric(),
    body('unitPrice').optional().isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Staff can only update quantity
    if (
      req.user.role === 'staff' &&
      Object.keys(req.body).some((k) => k !== 'quantity')
    ) {
      return res.status(403).json({ message: 'Staff can only update quantity' });
    }

    // 🔄 Accept 'price' as alias for 'unitPrice'
    if ('price' in req.body && !('unitPrice' in req.body)) {
      req.body.unitPrice = req.body.price;
      delete req.body.price;
    }

    Object.keys(req.body).forEach((k) => {
      if (req.body[k] === '') delete req.body[k];
    });

    try {
      const updated = await Inventory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user._id, lastUpdated: new Date() },
        { new: true, runValidators: true }
      )
        .populate('supplier', 'name contactPerson')
        .populate('updatedBy', 'name');

      if (!updated)
        return res.status(404).json({ message: 'Inventory item not found' });

      await checkAndCreateAlert(updated);
      res.json(updated);
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.sku)
        return res.status(409).json({ message: 'SKU already exists' });
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

/* ====================================================================== */
/*  DELETE /api/inventory/:id – remove                                    */
/* ====================================================================== */
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ====================================================================== */
/*  Helper: auto‑create low/out‑of‑stock alerts                           */
/* ====================================================================== */
async function checkAndCreateAlert(item) {
  if (item.quantity > item.reorderLevel) return;

  const type = item.quantity === 0 ? 'out-of-stock' : 'low-stock';
  const severity = item.quantity === 0 ? 'critical' : 'high';

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
      title: type === 'out-of-stock' ? 'Out of Stock Alert' : 'Low Stock Alert',
      message: `${item.name} (${item.sku}) is ${
        type === 'out-of-stock' ? 'out of stock' : `running low (${item.quantity} left)`
      }`,
    });
  }
}

module.exports = router;
