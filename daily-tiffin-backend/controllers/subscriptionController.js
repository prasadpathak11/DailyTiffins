const Subscription = require('../models/Subscription');

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const { planType, mealType, preference, startDate, deliveryAddress } = req.body;

    // Calculate total amount based on plan and meal type
    let basePrice = 0;
    
    if (mealType === 'breakfast') {
      basePrice = 85; // Base price for breakfast
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      basePrice = 95; // Base price for lunch/dinner
    } else if (mealType === 'all') {
      basePrice = 250; // Base price for all meals
    }

    let totalAmount = 0;
    
    if (planType === 'weekly') {
      // Weekly subscription price (7 days)
      totalAmount = Math.round(7 * basePrice * 0.90); // 10% discount
    } else if (planType === 'monthly') {
      // Monthly subscription price (30 days)
      totalAmount = Math.round(30 * basePrice * 0.80); // 20% discount
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      planType,
      mealType,
      preference,
      startDate: startDate || new Date(),
      deliveryAddress: deliveryAddress || req.user.address,
      totalAmount
    });

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    // Make sure user owns the subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to access this subscription' 
      });
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
  try {
    const { preference, deliveryAddress } = req.body;
    
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    // Make sure user owns the subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to update this subscription' 
      });
    }

    // Cannot update if cancelled or expired
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot update a subscription that is ${subscription.status}` 
      });
    }

    // Only allow updating preference and delivery address
    const fieldsToUpdate = {};
    if (preference) fieldsToUpdate.preference = preference;
    if (deliveryAddress) fieldsToUpdate.deliveryAddress = deliveryAddress;

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    // Make sure user owns the subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to cancel this subscription' 
      });
    }

    // Cannot cancel if already cancelled or expired
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Subscription is already cancelled' 
      });
    }

    if (subscription.status === 'expired') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel an expired subscription' 
      });
    }

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Renew subscription
// @route   POST /api/subscriptions/:id/renew
// @access  Private
exports.renewSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }

    // Make sure user owns the subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized to renew this subscription' 
      });
    }

    // Only allow renewing expired or cancelled subscriptions
    if (subscription.status === 'active') {
      return res.status(400).json({ 
        success: false, 
        error: 'Subscription is already active' 
      });
    }

    // Create new start and end dates
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    if (subscription.planType === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (subscription.planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update subscription
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        startDate,
        endDate,
        paymentStatus: 'pending'
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSubscription
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
