/* ------------------------------------------------------------------ */
/*  routes/reports.js                                                 */
/* ------------------------------------------------------------------ */
const express  = require('express');
const PDFDocument = require('pdfkit');                // ✅ new
const Inventory = require('../models/Inventory');
const Supplier  = require('../models/Supplier');
const User      = require('../models/User');
const Alert     = require('../models/Alert');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/* =================================================================== */
/*  POST /api/reports/generate  (admin only)                           */
/* =================================================================== */
router.post('/generate', auth, authorize('admin'), async (req, res) => {
  try {
    /* ---- inputs --------------------------------------------------- */
    const { format = 'pdf', startDate, endDate } = { ...req.query, ...req.body };

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 3600 * 1000);            // last 30 days
    const end   = endDate ? new Date(endDate) : new Date();

    /* ---- DB aggregation (unchanged) ------------------------------- */
    const [invSummary = {}] = await Inventory.aggregate([
      { $group: {
        _id: null,
        totalItems     : { $sum: 1 },
        totalValue     : { $sum: { $multiply: ['$quantity', '$price'] } },
        lowStockItems  : { $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] } },
        outOfStockItems: { $sum: { $cond: [{ $eq: ['$quantity', 0] }, 1, 0] } },
        avgPrice       : { $avg: '$price'    },
        avgQuantity    : { $avg: '$quantity' },
      } },
      { $project: { _id: 0 } },
    ]);

    const categoryStats = await Inventory.aggregate([
      { $group: {
        _id        : '$category',
        itemCount  : { $sum: 1 },
        totalValue : { $sum: { $multiply: ['$quantity', '$price'] } },
        avgPrice   : { $avg: '$price' },
      } },
      { $sort: { totalValue: -1 } },
    ]);

    const supplierStats = await Supplier.aggregate([
      { $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'supplier',
        as: 'items',
      } },
      { $project: {
        name      : 1,
        itemCount : { $size: '$items' },
        totalValue: {
          $sum: {
            $map: {
              input: '$items',
              as: 'i',
              in : { $multiply: ['$$i.quantity', '$$i.price'] },
            },
          },
        },
      } },
      { $sort: { totalValue: -1 } },
    ]);

    const userStats = await User.aggregate([
      { $group: {
        _id        : '$role',
        count      : { $sum: 1 },
        activeCount: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
      } },
    ]);

    const alertBreakdown = await Alert.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: {
        _id     : '$type',
        count   : { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$resolved', true] }, 1, 0] } },
      } },
    ]);

    /* ---- final report obj ---------------------------------------- */
    const report = {
      generatedAt: new Date(),
      period: { start, end },
      summary: {
        inventory : invSummary,
        categories: categoryStats,
        suppliers : {
          total      : await Supplier.countDocuments(),
          performance: supplierStats,
        },
        users : {
          total     : await User.countDocuments(),
          breakdown : userStats,
        },
        alerts: {
          total     : await Alert.countDocuments({ createdAt: { $gte: start, $lte: end } }),
          breakdown : alertBreakdown,
        },
      },
    };

    /* ---- respond -------------------------------------------------- */
    if (format === 'csv') {
      res.setHeader('Content-Type',        'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
      return res.send(toCsv(report));
    }

    /* default PDF --------------------------------------------------- */
    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

    return buildPdf(report, res);
  } catch (err) {
    console.error('report‑generate error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ------------------------------------------------------------------ */
/*  Helper: CSV formatter (simple)                                    */
/* ------------------------------------------------------------------ */
function toCsv(r) {
  const out = [];
  out.push('Inventory Management System Report');
  out.push(`Generated,${r.generatedAt.toISOString()}`);
  out.push(`Period,${r.period.start.toISOString()},${r.period.end.toISOString()}`);
  out.push('');
  out.push('INVENTORY SUMMARY');
  Object.entries(r.summary.inventory).forEach(([k, v]) => out.push(`${k},${v}`));
  out.push('');
  out.push('CATEGORY BREAKDOWN');
  out.push('Category,Items,Total Value,Average Price');
  r.summary.categories.forEach(c =>
    out.push(`${c._id},${c.itemCount},${c.totalValue.toFixed(2)},${c.avgPrice.toFixed(2)}`));
  out.push('');
  out.push('SUPPLIER PERFORMANCE');
  out.push('Supplier,Items,Total Value');
  r.summary.suppliers.performance.forEach(s =>
    out.push(`${s.name},${s.itemCount},${s.totalValue.toFixed(2)}`));

  return out.join('\n');
}

/* ------------------------------------------------------------------ */
/*  Helper: PDF builder (pdfkit)                                      */
/* ------------------------------------------------------------------ */
function buildPdf(r, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  /* Header */
  doc.fontSize(18).text('Inventory Management System Report', { align: 'center' }).moveDown();
  doc.fontSize(10).text(`Generated: ${r.generatedAt.toLocaleString()}`);
  doc.text(`Period   : ${r.period.start.toDateString()}  –  ${r.period.end.toDateString()}`);
  doc.moveDown(1.5);

  /* Inventory summary */
  doc.fontSize(14).text('Inventory Summary').moveDown(0.5);
  const inv = r.summary.inventory;
  Object.entries(inv).forEach(([k, v]) => doc.fontSize(10).text(`${k}: ${v}`));
  doc.moveDown(1);

  /* Categories */
  doc.fontSize(14).text('Category Breakdown').moveDown(0.5);
  r.summary.categories.forEach(c =>
    doc.fontSize(10).text(
      `${c._id.padEnd(15)}  Items: ${String(c.itemCount).padEnd(5)}  Total: $${c.totalValue.toFixed(2)}`
    ));
  doc.moveDown(1);

  /* Suppliers */
  doc.fontSize(14).text('Top Suppliers').moveDown(0.5);
  r.summary.suppliers.performance.forEach(s =>
    doc.fontSize(10).text(
      `${s.name.padEnd(20)}  Items: ${String(s.itemCount).padEnd(5)}  Value: $${s.totalValue.toFixed(2)}`
    ));
  doc.moveDown(1);

  /* Users */
  doc.fontSize(14).text('Users by Role').moveDown(0.5);
  r.summary.users.breakdown.forEach(u =>
    doc.fontSize(10).text(`${u._id.padEnd(10)}  Count: ${u.count}  Active: ${u.activeCount}`));
  doc.moveDown(1);

  /* Alerts */
  doc.fontSize(14).text('Alerts (period)').moveDown(0.5);
  r.summary.alerts.breakdown.forEach(a =>
    doc.fontSize(10).text(
      `${a._id.padEnd(15)}  Count: ${String(a.count).padEnd(4)}  Resolved: ${a.resolved}`
    ));

  doc.end();          // 🚀 stream directly to the client
}

module.exports = router;
