const express = require('express');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/analytics
 * Auth: admin | manager
 *
 * Response
 * ├─ inventoryStats: { totalItems, lowStockItems, totalValue, trends[] }
 * └─ supplierStats: { totalSuppliers, topSuppliers[] }
 */
router.get('/', auth, authorize('admin', 'manager'), async (req, res) => {
  try {
    /* ------------------------------------------------------------
       1)  Inventory totals
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
       2)  Supplier ranking (top 5 by itemCount)
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
      {
        $project: {
          name: 1,
          itemCount: { $size: '$items' },
        },
      },
      { $sort: { itemCount: -1 } },
      { $limit: 5 },
    ];

    /* ------------------------------------------------------------
       3)  Inventory trends – last 6 calendar months
           (based on the month each SKU was added)
    ------------------------------------------------------------ */
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // today minus 5 → six months total

    const trendsPipeline = [
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    /* ------------------------------------------------------------
       Run all three pipelines in parallel
    ------------------------------------------------------------ */
    const [
      [inventoryTotals = { totalItems: 0, lowStockItems: 0, totalValue: 0 }],
      topSuppliers,
      rawTrends,
      totalSuppliers,
    ] = await Promise.all([
      Inventory.aggregate(inventoryTotalsPipeline),
      Supplier.aggregate(supplierStatsPipeline),
      Inventory.aggregate(trendsPipeline),
      Supplier.countDocuments(),
    ]);

    /* ------------------------------------------------------------
       Post‑process trends → [{ month: 'Jan 2025', quantity: … }, …]
    ------------------------------------------------------------ */
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    // Fill any missing months with 0 so the chart is continuous
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // e.g. "2025-7"
      const bucket = rawTrends.find(
        (t) => `${t._id.year}-${t._id.month}` === key,
      );
      trends.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        quantity: bucket ? bucket.quantity : 0,
      });
    }

    /* ------------------------------------------------------------
       Send response
    ------------------------------------------------------------ */
    res.json({
      inventoryStats: { ...inventoryTotals, trends },
      supplierStats: { totalSuppliers, topSuppliers },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
