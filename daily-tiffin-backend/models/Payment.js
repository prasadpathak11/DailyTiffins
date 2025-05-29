const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: [true, 'Please add the payment amount']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please add the payment method']
  },
  transactionId: {
    type: String,
    required: [true, 'Please add the transaction ID']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Ensure either orderId or subscriptionId is present
PaymentSchema.pre('save', function(next) {
  if (!this.orderId && !this.subscriptionId) {
    return next(new Error('Payment must be associated with either an order or a subscription'));
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
