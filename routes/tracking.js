const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Get order tracking info
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name phone')
      .populate('items.menuItem', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order._id,
      status: order.status,
      items: order.items,
      deliveryAddress: order.deliveryAddress,
      deliveryLocation: order.deliveryLocation,
      deliveryPerson: order.deliveryPerson,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update delivery person location
router.put('/delivery/:orderId/location', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        'deliveryPerson.currentLocation': { latitude, longitude }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('deliveryLocationUpdate', {
      orderId: order._id,
      location: { latitude, longitude }
    });

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;