const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing admin
    await Admin.deleteMany({});
    
    // Create new admin with known credentials
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new Admin({
      name: 'mits',
      email: 'dondlavinay.d111@gmail.com',
      password: '123456',
      phone: '9876543210',
      address: 'MITS Campus',
      canteenId: 'MITS001'
    });
    
    await admin.save();
    console.log('Admin reset successfully!');
    console.log('Email: admin@mitscanteen.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

resetAdmin();