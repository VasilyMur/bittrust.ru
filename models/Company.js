const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugify = require('slugify');



const companySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Введите название школы',
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'Введите координаты!'
    }],
    address: {
    type: String,
    required: 'Введите адрес!'
    }
  }

});

companySchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slugify(this.name).toLowerCase();
  next();
  //TODO - make more resilien so slugs are unique
});





module.exports = mongoose.model('Company', companySchema);
