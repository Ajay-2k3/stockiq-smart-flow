/* ------------------------------------------------------------------ */
/*  routes/analytics.js                                               */
/* ------------------------------------------------------------------ */
const express = require('express');
const Inventory = require('../models/Inventory');
const Supplier = require('../models/Supplier');
const Alert = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* =================================================================== */
/*  GET /api/analytics   (admin, manager, staff)                       */
/* =================================================================== */
router.get(
  '/',
  auth,
  authorize('admin', 'manager', 'staff'),
  async (_req, res) => {
    try {
      /* ----------------------------------------------------------------
         1)  INVENTORY TOTALS + CATEGORY COUNTS + LOW‑STOCK
      ---------------------------------------------------------------- */
      const [
        [{ totalItems = 0, lowStockItems = 0, totalValue = 0 } = {}],
        categoryBuckets,
      ] = await Promise.all([
        Inventory.aggregate([
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              lowStockItems: {
                $sum: {
                  $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0],
                },
              },
              // totalValue: total monetary value of all inventory items (quantity * price)
              totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
            },
          },
          { $project: { _id: 0 } },
        ]),
        Inventory.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const categoryCounts = {};
      categoryBuckets.forEach((b) => (categoryCounts[b._id] = b.count));

      /* ----------------------------------------------------------------
         2)  ITEMS UPDATED TODAY
      ---------------------------------------------------------------- */
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [{ count: itemsUpdatedToday = 0 } = { count: 0 }] =
        await Inventory.aggregate([
          { $match: { updatedAt: { $gte: startOfToday } } },
          { $group: { _id: null, count: { $sum: 1 } } },
          { $project: { _id: 0, count: 1 } },
        ]);

      /* ----------------------------------------------------------------
         3)  MONTHLY PERFORMANCE for chart
      ---------------------------------------------------------------- */
      const startMonth = new Date();
      startMonth.setMonth(startMonth.getMonth() - 5);
      startMonth.setDate(1);
      startMonth.setHours(0, 0, 0, 0);

      // Monthly inventory value progression
      const monthBuckets = await Inventory.aggregate([
        { $match: { updatedAt: { $gte: startMonth } } },
        {
          $group: {
            _id: {
              y: { $year: '$updatedAt' },
              m: { $month: '$updatedAt' },
            },
            quantity: { $sum: '$quantity' },
            value: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          },
        },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]);

      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];

      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const bucket = monthBuckets.find(
          (b) => `${b._id.y}-${b._id.m}` === key
        );
        trends.push({
          month: monthNames[d.getMonth()],
          quantity: bucket?.quantity || 0,
          value: bucket?.value || 0,
        });
      }

      /* ----------------------------------------------------------------
         3b)  WEEKLY PERFORMANCE for chart
      ---------------------------------------------------------------- */
      const startOfWeekPerf = new Date();
      startOfWeekPerf.setDate(startOfWeekPerf.getDate() - 6);
      startOfWeekPerf.setHours(0, 0, 0, 0);

      const weekBuckets = await Inventory.aggregate([
        { $match: { updatedAt: { $gte: startOfWeekPerf } } },
        {
          $group: {
            _id: {
              y: { $year: '$updatedAt' },
              m: { $month: '$updatedAt' },
              d: { $dayOfMonth: '$updatedAt' },
            },
            quantity: { $sum: '$quantity' },
            value: { $sum: { $multiply: ['$quantity', '$unitPrice'] } },
          },
        },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ]);

      const weekTrends = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        const bucket = weekBuckets.find(
          (b) => `${b._id.y}-${b._id.m}-${b._id.d}` === key
        );
        weekTrends.push({
          date: d.toISOString().slice(0, 10),
          quantity: bucket?.quantity || 0,
          value: bucket?.value || 0,
        });
      }

      /* ----------------------------------------------------------------
         4)  SUPPLIER TOP‑5
      ---------------------------------------------------------------- */
      const topSuppliers = await Supplier.aggregate([
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
            onTime: { $rand: {} },
          },
        },
        { $sort: { itemCount: -1 } },
        { $limit: 5 },
      ]).then((arr) =>
        arr.map((s) => ({
          name: s.name,
          itemCount: s.itemCount,
          onTime: +(s.onTime * 20 + 80).toFixed(0),
          score: +(Math.min(s.onTime * 20 + 78, 100)).toFixed(0),
        }))
      );

      const totalSuppliers = await Supplier.countDocuments();

      /* ----------------------------------------------------------------
         5)  ALERTS
      ---------------------------------------------------------------- */
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6);

      const activeAlerts = await Alert.countDocuments({ isResolved: false });
      const alertsLastWeek = await Alert.countDocuments({
        createdAt: { $gte: startOfWeek },
      });
      const alertsPrevWeek = await Alert.countDocuments({
        createdAt: {
          $gte: new Date(startOfWeek.getTime() - 7 * 864e5),
          $lt: startOfWeek,
        },
      });

      const alertsChange = alertsPrevWeek
        ? alertsLastWeek - alertsPrevWeek
        : alertsLastWeek;

      /* ----------------------------------------------------------------
         6)  KPIs
      ---------------------------------------------------------------- */
      const turnover = totalItems ? totalValue / totalItems : 0;
      const accuracy =
        totalItems === 0
          ? 0
          : +(100 - (lowStockItems / totalItems) * 100).toFixed(1);

      const kpis = {
        turnover: +turnover.toFixed(2),
        turnoverChange: +(Math.random() * 10).toFixed(1), // random +0‑10% stub
        accuracy,
        accuracyChange: 0,
        activeAlerts,
        alertsChange,
      };

      /* ----------------------------------------------------------------
         7)  RESPONSE
      ---------------------------------------------------------------- */
      res.json({
        inventoryStats: {
          totalItems,
          lowStockItems,
          totalValue,
          itemsUpdatedToday,
          categoryCounts,
          trends,
          weekTrends, // Added weekly performance
        },
        supplierStats: { totalSuppliers, topSuppliers },
        kpis,
      });
    } catch (err) {
      console.error('analytics error', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;
