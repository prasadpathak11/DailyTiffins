const Order = require('../models/Order');
const Meal = require('../models/Meal');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please add at least one item to order' 
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const meal = await Meal.findById(item.meal);
      
      if (!meal) {
        return res.status(404).json({ 
          success: false, 
          error: `Meal with id ${item.meal} not found` 
        });
      }
      
      if (!meal.isAvailable) {
        return res.status(400).json({ 
          success: false, 
          error: `Meal ${meal.name} is not available` 
        });
      }
      
      totalAmount += meal.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address
    });

    // Populate meal details
    await order.populate('items.meal', 'name price category type image');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.meal', 'name price category type image')
      .sort('-orderDate');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.meal', 'name price category type image');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    // Make sure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to access this order' 
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a status' 
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    // Make sure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to update this order' 
      });
    }

    // Cannot change status if already delivered or cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: `Order is already ${order.status}` 
      });
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.meal', 'name price category type image');

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }

    // Make sure user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to cancel this order' 
      });
    }

    // Cannot cancel if already delivered
    if (order.status === 'delivered') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel an order that has been delivered' 
      });
    }

    // Cannot cancel if already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is already cancelled' 
      });
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    ).populate('items.meal', 'name price category type image');

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
