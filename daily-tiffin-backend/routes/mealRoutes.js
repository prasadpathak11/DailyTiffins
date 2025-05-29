const express = require('express');
const { 
  getMeals, 
  getMeal, 
  createMeal, 
  updateMeal, 
  deleteMeal 
} = require('../controllers/mealController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getMeals)
  .post(protect, createMeal);

router.route('/:id')
  .get(getMeal)
  .put(protect, updateMeal)
  .delete(protect, deleteMeal);

module.exports = router;
