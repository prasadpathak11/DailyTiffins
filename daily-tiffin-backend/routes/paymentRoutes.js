const express = require('express');
const { 
  createPaymentIntent, 
  verifyPayment, 
  getPaymentHistory 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
