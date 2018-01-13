const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.loginForm = (req, res) => {
  res.render('login', {title: 'Вход'});
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Регистрация' });
};

// Express Validator from appjs - Refister form validation Middleware
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name'); // same as sanitize req.body.name
  req.checkBody('name', 'Введите имя!').notEmpty();
  req.checkBody('email', 'Неправильный формат email!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Введите пароль!').notEmpty();
  req.checkBody('password-confirm', 'Введите подтверждение пароля!').notEmpty();
  req.checkBody('password-confirm', 'Пароли не совпадают!').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; //stop the function from running
  }
  next(); //there were no errors
};

// We successfully pass above form Validation -> req.body contains all form Data
exports.register = async (req, res, next) => {
  try {
    const user = new User({ email: req.body.email, name: req.body.name });
    // user .Register method to Add Password, hash it and save EVERYTHING (email, name, pass(its hash)) to the DB
    // .Register comes from passportLocalMongoose plugin - on our User model
    // .Register DOESNOT return a Promise and requires a callback-> thus we promisify it!!

    // User.register(user, req.body.password, function(err, user) {
    //
    // });
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    next();

  } catch(e) {
    if (e.name == 'UserExistsError') {
      req.flash('error', 'Пользователь с таким email адресом уже зарегистрирован!');
      res.redirect('back');
    } else {
      res.render('error', {message:'Something went wrong'});
    }
  };
};

// Account - gravatar link
exports.account = (req, res) => {
  res.render('account', { title: 'Редактировать данные'});
};

exports.updateAccount = async (req, res) => {
  try {

    const updates = {
      name: req.body.name,
      email: req.body.email
    };
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      //options. constext - required by mongoose to function properly
      { new: true, runValidators: true, context: 'query' }
    );
    req.flash('success', 'Данные профиля обновлены!');
    res.redirect('back');
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};
