const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a meal name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['breakfast', 'lunch', 'dinner', 'instant']
  },
  type: {
    type: String,
    required: [true, 'Please select a meal type'],
    enum: ['veg', 'non-veg']
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meal', MealSchema);
