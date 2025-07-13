const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const inventoryRoutes = require('./routes/inventory');
const supplierRoutes = require('./routes/suppliers');
const alertRoutes = require('./routes/alerts');

const User = require('./models/User');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', require('./routes/analytics'));

// Auto Admin Seeding
const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'admin@stockiq.com' });

    if (admin) {
      // ✅ Let schema handle hashing
      admin.password = 'admin123';
      await admin.save();

      console.log("🔁 Admin password reset:");
      console.log(`🆔 ID     : ${admin._id}`);
      console.log(`📧 Email  : ${admin.email}`);
      console.log(`🔐 Password: admin123`);
      console.log(`👤 Role   : ${admin.role}`);
    } else {
      // 🆕 Create new admin (raw password)
      const newAdmin = await User.create({
        name: "Super Admin",
        email: "admin@stockiq.com",
        password: 'admin123', // raw
        role: "admin"
      });

      console.log("✅ Admin created:");
      console.log(`🆔 ID     : ${newAdmin._id}`);
      console.log(`📧 Email  : ${newAdmin.email}`);
      console.log(`🔐 Password: admin123`);
      console.log(`👤 Role   : admin`);
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  }
};




// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stockiq');
    console.log('✅ MongoDB connected');
    await seedAdmin();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});