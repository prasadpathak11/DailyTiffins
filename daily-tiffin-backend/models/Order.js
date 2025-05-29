const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity can not be less than 1']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    id: String,
    method: String,
    amount: Number
  }
});

module.exports = mongoose.model('Order', OrderSchema);
