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
  },
  photo: String

});

companySchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slugify(this.name).toLowerCase();

  // find other companies that have a slug of comp, comp-1, comp-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  // find on this.constructor - because Company has not been created yet...
  const companiesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (companiesWithSlug.length) {
    this.slug = `${this.slug}-${companiesWithSlug.length + 1}`;
  }
  next();
  //TODO - make more resilien so slugs are unique
});

companySchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};



module.exports = mongoose.model('Company', companySchema);
