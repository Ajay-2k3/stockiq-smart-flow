const express = require('express');
const Inventory = require('../models/Inventory');
const Supplier  = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* =================================================================== */
/*  GET /api/analytics  – admin / manager                              */
/* =================================================================== */
router.get('/', auth, authorize('admin', 'manager', 'staff'), async (req, res) => {
  try {
    /* ------------------------------------------------------------
       1)  Inventory totals + low stock
    ------------------------------------------------------------ */
    const inventoryTotalsPipeline = [
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lowStockItems: {
            $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] },
          },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        },
      },
      { $project: { _id: 0 } },
    ];

    /* ------------------------------------------------------------
       1‑b)  Items updated today
    ------------------------------------------------------------ */
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const itemsUpdatedTodayPipeline = [
      { $match: { updatedAt: { $gte: startOfToday } } },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } },
    ];

    /* ------------------------------------------------------------
       2)  Supplier ranking (top 5)
    ------------------------------------------------------------ */
    const supplierStatsPipeline = [
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: 'supplier',
          as: 'items',
        },
      },
      { $project: { name: 1, itemCount: { $size: '$items' } } },
      { $sort: { itemCount: -1 } },
      { $limit: 5 },
    ];

    /* ------------------------------------------------------------
       3)  Trend – last 6 calendar months
    ------------------------------------------------------------ */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const trendsPipeline = [
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    /* ------------------------------------------------------------
       Run all in parallel
    ------------------------------------------------------------ */
    const [
      [totals = { totalItems: 0, lowStockItems: 0, totalValue: 0 }],
      [{ count: itemsUpdatedToday = 0 } = { count: 0 }],
      topSuppliers,
      rawTrends,
      totalSuppliers,
    ] = await Promise.all([
      Inventory.aggregate(inventoryTotalsPipeline),
      Inventory.aggregate(itemsUpdatedTodayPipeline),
      Supplier.aggregate(supplierStatsPipeline),
      Inventory.aggregate(trendsPipeline),
      Supplier.countDocuments(),
    ]);

    /* ------------------------------------------------------------
       Fill 6‑month trend gaps
    ------------------------------------------------------------ */
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      const bucket = rawTrends.find(t => `${t._id.year}-${t._id.month}` === key);
      trends.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        quantity: bucket ? bucket.quantity : 0,
      });
    }

    /* ------------------------------------------------------------
       Respond
    ------------------------------------------------------------ */
    res.json({
      inventoryStats: { ...totals, itemsUpdatedToday, trends },
      supplierStats : { totalSuppliers, topSuppliers },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
