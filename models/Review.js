const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Введите имя автора!'
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: 'Введите название компании!'
  },
  text: {
    type: String,
    required: 'Введите текст обзора!'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});


module.exports = mongoose.model('Review', reviewSchema);
