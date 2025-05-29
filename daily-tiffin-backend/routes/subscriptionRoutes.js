const express = require('express');
const { 
  createSubscription, 
  getUserSubscriptions, 
  getSubscriptionById, 
  updateSubscription, 
  cancelSubscription,
  renewSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createSubscription)
  .get(protect, getUserSubscriptions);

router.route('/:id')
  .get(protect, getSubscriptionById)
  .put(protect, updateSubscription);

router.route('/:id/cancel')
  .put(protect, cancelSubscription);

router.route('/:id/renew')
  .post(protect, renewSubscription);

module.exports = router;
