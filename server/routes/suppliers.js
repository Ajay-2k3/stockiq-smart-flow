const express = require('express');
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* ==================================================================== */
/*  GET /api/suppliers – list                                           */
/* ==================================================================== */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, active } = req.query;

    const query = {};
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) query.$text = { $search: search };

    /* grand‑total */
    const totalSuppliers = await Supplier.countDocuments(query);

    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({
      totalSuppliers,                     // << NEW
      suppliers,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(totalSuppliers / +limit),
        totalItems: totalSuppliers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ==================================================================== */
/*  GET /api/suppliers/:id – single                                     */
/* ==================================================================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('createdBy', 'name');
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ==================================================================== */
/*  POST /api/suppliers – create                                        */
/* ==================================================================== */
router.post(
  '/',
  auth,
  authorize('admin', 'manager'),
  [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('contactPerson').notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be 1‑5'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const supplier = await Supplier.create({ ...req.body, createdBy: req.user._id });
      await supplier.populate('createdBy', 'name');
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/* ==================================================================== */
/*  PUT /api/suppliers/:id – update                                     */
/* ==================================================================== */
router.put(
  '/:id',
  auth,
  authorize('admin', 'manager'),
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate('createdBy', 'name');

      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/* ==================================================================== */
/*  DELETE /api/suppliers/:id – delete                                  */
/* ==================================================================== */
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
