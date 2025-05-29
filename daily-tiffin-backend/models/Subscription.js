const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: [true, 'Please select a plan type']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'all'],
    required: [true, 'Please select a meal type']
  },
  preference: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: [true, 'Please select a meal preference']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please add a delivery address']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please add the total amount']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate end date based on plan type if not provided
SubscriptionSchema.pre('save', function(next) {
  if (!this.isModified('endDate') || this.endDate) {
    return next();
  }
  
  const startDate = new Date(this.startDate);
  
  if (this.planType === 'weekly') {
    this.endDate = new Date(startDate.setDate(startDate.getDate() + 7));
  } else if (this.planType === 'monthly') {
    this.endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
  }
  
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
