const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  try {
    req.body.author = req.user._id;
    req.body.company = req.params.id;

    const newReview = new Review(req.body);
    await newReview.save();
    req.flash('success', 'Ваш отзыв сохранен!');
    res.redirect('back');
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};
