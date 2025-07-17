/* ------------------------------------------------------------------ */
/*  server.js – main entry point                                      */
/* ------------------------------------------------------------------ */
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

/* ────────────────── Route modules ────────────────── */
const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const supplierRoutes  = require('./routes/suppliers');
const alertRoutes     = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes    = require('./routes/reports');   // ✅ NEW (single import)

const User = require('./models/User');

/* ────────────────── App & middleware ────────────────── */
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

/* ────────────────── API Routes ────────────────── */
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/alerts',    alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports',   reportRoutes);               // ✅ registered **once**

/* ────────────────── Seed / reset admin ────────────────── */
const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'admin@stockiq.com' });

    if (admin) {
      admin.password = 'admin123';          // hashed by pre‑save hook
      await admin.save();

      console.log('🔁 Admin password reset:');
      console.log(`🆔 ID      : ${admin._id}`);
      console.log(`📧 Email   : ${admin.email}`);
      console.log('🔐 Password: admin123');
      console.log(`👤 Role    : ${admin.role}`);
    } else {
      const newAdmin = await User.create({
        name:     'Super Admin',
        email:    'admin@stockiq.com',
        password: 'admin123',               // raw – will be hashed
        role:     'admin',
      });

      console.log('✅ Admin created:');
      console.log(`🆔 ID      : ${newAdmin._id}`);
      console.log(`📧 Email   : ${newAdmin.email}`);
      console.log('🔐 Password: admin123');
      console.log('👤 Role    : admin');
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  }
};

/* ────────────────── MongoDB connection ────────────────── */
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/stockiq',
    );
    console.log('✅ MongoDB connected');
    await seedAdmin();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

/* ────────────────── Start server ────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`👉 ${req.method} ${req.url}`);
  console.log(`🚀 Server running on port ${PORT}`);
});
