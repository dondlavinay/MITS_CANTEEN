const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['snacks', 'veg', 'nonveg', 'icecream', 'juice', 'starters'] },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, trim: true },
  available: { type: Boolean, default: true },
  stock: { type: Number, default: 50 },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);