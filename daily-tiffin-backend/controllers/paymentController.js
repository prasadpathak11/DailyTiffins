const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');

// @desc    Create payment intent
// @route   POST /api/payments/create
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { type, id, paymentMethod } = req.body;

    if (!type || !id || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Please provide type, id, and payment method'
      });
    }

    let amount = 0;
    let referenceModel;

    // Check type of payment (order or subscription)
    if (type === 'order') {
      referenceModel = await Order.findById(id);
      if (!referenceModel) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Ensure the order belongs to the user
      if (referenceModel.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to make payment for this order'
        });
      }

      amount = referenceModel.totalAmount;
    } else if (type === 'subscription') {
      referenceModel = await Subscription.findById(id);
      if (!referenceModel) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      // Ensure the subscription belongs to the user
      if (referenceModel.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to make payment for this subscription'
        });
      }

      amount = referenceModel.totalAmount;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type. Must be either "order" or "subscription"'
      });
    }

    // In a real implementation, we would integrate with a payment gateway like Razorpay
    // For now, we'll create a mock payment intent
    const paymentIntent = {
      id: 'pi_' + Math.random().toString(36).substring(2, 15),
      amount,
      currency: 'inr',
      status: 'requires_payment_method',
      created: Date.now()
    };

    res.status(200).json({
      success: true,
      data: {
        clientSecret: 'mock_secret_' + paymentIntent.id,
        amount: paymentIntent.amount
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { type, id, paymentIntentId, transactionId } = req.body;

    if (!type || !id || !paymentIntentId || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide type, id, paymentIntentId, and transactionId'
      });
    }

    let referenceModel;
    let paymentData = {};

    // Check type of payment (order or subscription)
    if (type === 'order') {
      referenceModel = await Order.findById(id);
      if (!referenceModel) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      // Ensure the order belongs to the user
      if (referenceModel.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to verify payment for this order'
        });
      }

      paymentData = {
        user: req.user.id,
        orderId: id,
        amount: referenceModel.totalAmount,
        paymentMethod: 'card', // This would be dynamic in a real implementation
        transactionId,
        status: 'completed'
      };

      // Update order payment status
      await Order.findByIdAndUpdate(id, {
        paymentStatus: 'completed',
        paymentDetails: {
          id: transactionId,
          method: 'card',
          amount: referenceModel.totalAmount
        }
      });
    } else if (type === 'subscription') {
      referenceModel = await Subscription.findById(id);
      if (!referenceModel) {
        return res.status(404).json({
          success: false,
          error: 'Subscription not found'
        });
      }

      // Ensure the subscription belongs to the user
      if (referenceModel.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to verify payment for this subscription'
        });
      }

      paymentData = {
        user: req.user.id,
        subscriptionId: id,
        amount: referenceModel.totalAmount,
        paymentMethod: 'card', // This would be dynamic in a real implementation
        transactionId,
        status: 'completed'
      };

      // Update subscription payment status
      await Subscription.findByIdAndUpdate(id, {
        paymentStatus: 'completed'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type. Must be either "order" or "subscription"'
      });
    }

    // Create payment record
    const payment = await Payment.create(paymentData);

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('orderId', 'status orderDate')
      .populate('subscriptionId', 'planType mealType status')
      .sort('-timestamp');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
