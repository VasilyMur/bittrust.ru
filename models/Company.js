const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slugify = require('slugify');
const validators = require('mongoose-validators');


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
  url: {
    type: String,
    trim: true
  },
  tel: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /\d{1}-\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: '{VALUE} Неверный Формат!'
    },
    required: [true, 'Введите номер телефона']
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
  photo: String,
  // *1 - set author in model - set author when creating company in -> companyController
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Введите имя автора'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define Indexes - Create a Compund Index. Search Website using 2 fields!
//'text' option allows to perform search on text inside these fields using $text operator !!
//$text by default is case insensitive by default
companySchema.index({
  name: 'text',
  description: 'text'
});

// add location field to DB index - to perform searches in Google Maps
companySchema.index({ location: '2dsphere' });

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

// Get All Tags & Count - front page
companySchema.statics.getTagsList = function() {
  // aggregate - returns Promise - that we await inside Controller
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// Get All Tags & Count - individual tag pages
companySchema.statics.getTagData = function(tag) {
  // aggregate - returns Promise - that we await inside Controller
  return this.aggregate([
    { $unwind: '$tags' },
    { $match: { tags: tag} },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
  ]);
};

// Aggregation - Top Companies Page
companySchema.statics.getTopCompanies = function() {
  return this.aggregate([
    { $lookup: { from: 'reviews', localField: '_id', foreignField: 'company', as: 'reviews'  }},
    // where 2nd item in reviews - exists true!
    { $match: { 'reviews.1': { $exists: true } }},
    { $addFields: { averageRating: { $avg: '$reviews.rating' }}},
    { $sort: { averageRating: -1 }},
    { $limit: 10 }
  ]);
};

// !! virtual fields - Mongoose option - not used with Mongodb aggregate
// Add virtual field (reviews) to our schema (Company)
// In the options We say "go to another model (Review) and do a query for us"
// Find reviews where the Company _id property === Reviews company property
companySchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', //which field on the company?
  foreignField: 'company' //which field on the review?
});

function autopopulate(next) {
  this.populate('reviews');
  next();
};

// No need to update multiple queries - use autopopulate!
companySchema.pre('find', autopopulate);
companySchema.pre('findOne', autopopulate);



module.exports = mongoose.model('Company', companySchema);
