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

function autopopulate(next) {
  this.populate('author');
  next();
};

// Each time review is queried - autopopulate author. Virtual review field in Company
reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);


module.exports = mongoose.model('Review', reviewSchema);
