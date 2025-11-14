const express = require('express');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate a menu item after order delivery
router.post('/item/:itemId', auth, async (req, res) => {
  try {
    const { rating, review, orderId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify user has ordered this item and it's delivered
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered',
      'items.menuItem': req.params.itemId
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only rate items from your delivered orders' });
    }

    const menuItem = await MenuItem.findById(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if user already rated this item
    const existingRating = menuItem.ratings.find(r => r.user.toString() === req.user._id.toString());
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.date = new Date();
    } else {
      // Add new rating
      menuItem.ratings.push({
        user: req.user._id,
        rating,
        review,
        date: new Date()
      });
      menuItem.totalRatings += 1;
    }

    // Calculate average rating
    const totalRating = menuItem.ratings.reduce((sum, r) => sum + r.rating, 0);
    menuItem.averageRating = totalRating / menuItem.ratings.length;

    await menuItem.save();
    
    res.json({ 
      message: 'Rating submitted successfully',
      averageRating: menuItem.averageRating,
      totalRatings: menuItem.totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ratings for a menu item
router.get('/item/:itemId', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId)
      .populate('ratings.user', 'name');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({
      averageRating: menuItem.averageRating,
      totalRatings: menuItem.totalRatings,
      ratings: menuItem.ratings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;