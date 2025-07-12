const express = require('express');
const { body, validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const inventory = await Inventory.find(query)
      .populate('supplier', 'name contactPerson')
      .populate('updatedBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inventory.countDocuments(query);

    res.json({
      inventory,
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

// Get single inventory item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('supplier')
      .populate('updatedBy', 'name');
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create inventory item
router.post('/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('reorderLevel').isNumeric().withMessage('Reorder level must be a number'),
    body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
    body('supplier').notEmpty().withMessage('Supplier is required')
  ],
  auth,
  authorize('admin', 'manager'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const inventoryData = {
        ...req.body,
        updatedBy: req.user._id
      };

      const item = new Inventory(inventoryData);
      await item.save();

      // Check if alert needed
      await checkAndCreateAlert(item);

      await item.populate('supplier', 'name contactPerson');
      await item.populate('updatedBy', 'name');

      res.status(201).json(item);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'SKU already exists' });
      } else {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
  }
);

// Update inventory item
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('reorderLevel').optional().isNumeric().withMessage('Reorder level must be a number'),
    body('unitPrice').optional().isNumeric().withMessage('Unit price must be a number')
  ],
  auth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Staff can only update quantity
      if (req.user.role === 'staff') {
        const allowedFields = ['quantity'];
        const updateFields = Object.keys(req.body);
        const isValidUpdate = updateFields.every(field => allowedFields.includes(field));
        
        if (!isValidUpdate) {
          return res.status(403).json({ message: 'Staff can only update quantity' });
        }
      }

      const item = await Inventory.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user._id, lastUpdated: new Date() },
        { new: true, runValidators: true }
      ).populate('supplier', 'name contactPerson')
       .populate('updatedBy', 'name');

      if (!item) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }

      // Check if alert needed after update
      await checkAndCreateAlert(item);

      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete inventory item
router.delete('/:id', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to check and create alerts
async function checkAndCreateAlert(item) {
  if (item.quantity <= item.reorderLevel) {
    const existingAlert = await Alert.findOne({
      type: item.quantity === 0 ? 'out-of-stock' : 'low-stock',
      relatedItem: item._id,
      isResolved: false
    });

    if (!existingAlert) {
      const alert = new Alert({
        type: item.quantity === 0 ? 'out-of-stock' : 'low-stock',
        title: item.quantity === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
        message: `${item.name} (${item.sku}) is ${item.quantity === 0 ? 'out of stock' : `running low (${item.quantity} remaining)`}`,
        severity: item.quantity === 0 ? 'critical' : 'high',
        relatedItem: item._id
      });
      await alert.save();
    }
  }
}

module.exports = router;