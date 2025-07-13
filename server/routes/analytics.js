const express = require('express');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Analytics endpoint
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0]
            }
          },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);

    const supplierStats = await Supplier.aggregate([
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'supplier',
          as: 'items'
        }
      },
      {
        $project: {
          name: 1,
          itemCount: { $size: '$items' }
        }
      },
      { $sort: { itemCount: -1 } },
      { $limit: 5 }
    ]);

    // Mock trends data for now
    const trends = [
      { month: 'Jan', quantity: 120 },
      { month: 'Feb', quantity: 135 },
      { month: 'Mar', quantity: 148 },
      { month: 'Apr', quantity: 142 },
      { month: 'May', quantity: 156 },
      { month: 'Jun', quantity: 163 }
    ];

    res.json({
      inventoryStats: {
        ...(inventoryStats[0] || { totalItems: 0, lowStockItems: 0, totalValue: 0 }),
        trends
      },
      supplierStats: {
        totalSuppliers: await Supplier.countDocuments(),
        topSuppliers: supplierStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;