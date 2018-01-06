const mongoose = require('mongoose');
const Company = mongoose.model('Company');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const nodemailer = require('nodemailer');

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
  res.render('editCompany', {title: 'Админ Добавить Компанию'});
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
    // *2 - setting author as referenced in Company Model -- >> populate to getCompanyBySlug
    req.body.author = req.user._id;
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

// * 4 - check if the company author id = user id
const confirmOwner = (company, user) => {
  if(!company.author.equals(user._id)) {
    throw Error('Требуются права администратора!');
  }
};

// Зашли в раздел Edit существующей компании
// * 5 - после того как нашли Компанию --> проверили confirmOwner
exports.editCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id });

    // confirm the user owns the Company
    confirmOwner(company, req.user);

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
    // * 3 - add .populate to get all author data instead of just ObjectId(used in Company Model)
    // ---> next Stop users that don't own a Company from Editing Companies --> Function Confirm Owner (used in editCompany)
    const company = await Company.findOne({ slug: req.params.slug }).populate('author reviews');
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

// Страница Категории
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

// ФОРМА SUBMIT по EMAIL
// Страница Добавить Компанию
exports.submitForm = (req, res) => {
  res.render('contact', {title: 'Добавить Компанию', description: 'Добавьте сервис или компанию на сайт Bittrust!'});
};

// Submit New Company
exports.submitCompany = (req, res) => {
  const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const mailOptions = {
        from: `Wes Bos <noreply@bittrust.ru>`,
        to: '2011mckinsey@gmail.com',
        subject: 'Website contact form',
        text: 'This will be filled later',
        html: `Name: ${req.body.name}<br>
              Description: ${req.body.description}<br>
              Address: ${req.body.address}<br>
              Website: ${req.body.url}<br>
              Phone: ${req.body.phone}<br>
              Email: ${req.body.email}<br>
              Tags: ${req.body.tags}
        `,
        attachments: []
        // attachments: [{
        //   // filename: req.body.photo,
        //   // content: new Buffer(req.file.buffer)
        // }]
    };


    if(req.file) {
      const extension = req.file.mimetype.split('/')[1];
      req.body.photo = `${uuid.v4()}.${extension}`;

      mailOptions.attachments = [{
        filename: req.body.photo,
        content: new Buffer(req.file.buffer)
      }]
    };


  const sendMail = promisify(transport.sendMail, transport);

  sendMail(mailOptions).then((info) => {
    req.flash('success', `Информация о <strong>${req.body.name}</strong> отправлена!`)
    res.redirect(`/submit`);
  }).catch((err) => {
    res.render('error', {message:'Something went wrong'});
  })
};

// API interface to search within Name and Description Text fields
exports.searchCompanies = async (req, res) => {
  try {
    // score - adds a temp field to the result with score
    const companies = await Company
    // 1- find Companies that match API query
    .find(
      { $text: { $search: req.query.q }},
      { score: { $meta: 'textScore' }}
    )
    // 2 - Sort based on higher score
    .sort({
    score: { $meta: 'textScore' }
  })
    .limit(10);

  res.json(companies);
  } catch (e) {
    res.render('error', {message:'Something went wrong'});
  }
};

// API interface to search for nearby Companies on GOOGLE Maps
exports.mapCompanies = async (req, res) => {
  try {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

    const q = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 10000 //10000 meters = 10km
        }
      }
    };

    // Use SELECT() to specify what JSON fields we need!! Can use - minus!
    // The LIMIT() to 10 points on the Map
    const companies = await Company.find(q).select('slug name description location photo').limit(10);
    res.json(companies);
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

// Map Page
exports.mapPage = (req, res) => {
  res.render('map', { title: 'Карта' });
};

// POST - Add or Remove Company Heart from User Heart Array
exports.heartCompany = async (req, res) => {
  try {
    const hearts = req.user.hearts.map(obj => {
      // Convert each Object in Array to String!!
      return obj.toString();
    });

    // If Array includes Company ID then Pull it otherwise addToSet (adds only once opposed to push)
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User
      .findByIdAndUpdate(req.user._id,
                { [operator]: { hearts: req.params.id }},
                { new: true }
              );
    res.json(user)
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

//Hearts Page
exports.getHearts = async (req, res) => {
  try {
    // Option 1 - Query User and Populate hearts
    //const user = await User.find({ _id: req.user._id }).populate('hearts');

    // Oprion 2 : Query Companies and find Comp IDs that are in Users Hearts Array!
    // array on user ---> req.user.hearts [IDs of companies]
    const companies = await Company.find({
      _id: { $in: req.user.hearts}
    });
    res.render('companies', { title: 'Все Лайки', companies });
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
}

// TOP page
exports.getTopCompanies = async (req, res) => {
  const companies = await Company.getTopCompanies();
  res.render('topCompanies', { title: 'Рейтинг Компаний', companies });
};
