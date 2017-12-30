const mongoose = require('mongoose');
const Company = mongoose.model('Company');

// upload photos package
const multer = require('multer');
// resize package
const Jimp = require('jimp');
// unique identifier package - prevent from same photo file names
const uuid = require('uuid');

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'Недопустимый формат' }, false);
        }
    }
};


// Главная Страница - Все Компании
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.render('companies', {title: 'Все Компании', companies});
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

// Зашли в Раздел Добавить Компанию
exports.addCompany = (req, res) => {
  res.render('editCompany', {title: 'Добавить Компанию'});
};



// stores image file into memory (doesn't save)
exports.upload = multer(multerOptions).single('photo');
// resize uploaded photos
exports.resize = async (req, res, next) => {
  try {
    // check if there is no new file to resize
    if( !req.file ) {
        next(); //skip to the next middleware
        return;
    };

    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;

    // now we resize
    const photo = await Jimp.read(req.file.buffer);
    await photo.resize(800, Jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`); // save
    // once we have written the photo to our filesystem keep going!
    next();
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  };
};

// POST: Заполнили данные в разделе ADD и Нажали Submit - чтобы добавить Компанию
exports.createCompany = async (req, res) => {
  try {
    const company = await (new Company(req.body)).save();
    req.flash('success', `Компания ${company.name} сохранена! <a href="/companies/${company.slug}">Посмотреть компанию</a>`);
    res.redirect(`/companies/${company.slug}`);
  } catch(err) {
      if (err.name == 'ValidationError') {
        const errorKeys = Object.keys(err.errors);
        errorKeys.forEach(key => req.flash('error', err.errors[key].message));
        res.redirect('back');
      } else {
        res.render('error', {message:'Something went wrong'});
      }
  }
};


// Зашли в раздел Edit существующей компании
exports.editCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id });
    res.render('editCompany', { title: `Редактировать данные ${company.name}`, company });
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

// POST: Сделали Submit обновленных данных по Компании из раздела Edit
exports.updateCompany = async (req, res) => {
  try {
    //Set the location data to be a point (dissapears after school update)
    req.body.location.type = 'Point';

    const company = await Company.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true }).exec();
    req.flash('success', `Информация о компании <strong>${company.name}</strong> обнавлена! <a href="/companies/${company.slug}">Посмотреть компанию</a>`);
    res.redirect(`/companies/${company._id}/edit`);
  } catch(err) {
      if (err.name == 'ValidationError') {
        const errorKeys = Object.keys(err.errors);
        errorKeys.forEach(key => req.flash('error', err.errors[key].message));
        res.redirect('back');
      } else {
        res.render('error', {message:'Something went wrong'});
      }
  }
};

// Страница Компании
exports.getCompanyBySlug = async (req, res, next) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    // render 404 if no matching company found (not to display "someth went wrong")
    if (!company) {
      next();
      return;
    }
    res.render('company', { title: company.name, company });
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

exports.getCompaniesByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = Company.getTagsList();
    const companiesPromise = Company.find({ tags: tagQuery });
    const [tags, companies] = await Promise.all([tagsPromise, companiesPromise]);

    res.render('tag', {title: 'Категории', tags, tag, companies});
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};
