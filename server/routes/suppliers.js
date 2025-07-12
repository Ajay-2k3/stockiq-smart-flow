const express = require('express');
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all suppliers
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, active } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Supplier.countDocuments(query);

    res.json({
      suppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single supplier
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create supplier
router.post('/',
  [
    body('name').notEmpty().withMessage('Supplier name is required'),
    body('contactPerson').notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  auth,
  authorize('admin', 'manager'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const supplierData = {
        ...req.body,
        createdBy: req.user._id
      };

      const supplier = new Supplier(supplierData);
      await supplier.save();

      await supplier.populate('createdBy', 'name');

      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update supplier
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  auth,
  authorize('admin', 'manager'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name');

      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }

      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete supplier
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;