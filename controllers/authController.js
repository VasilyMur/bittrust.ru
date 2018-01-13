// Passport - Actually Allows to LOG user in after form validation and .register of User to DB
// Passport - configured in the ./handlers/passport
// Passport - no need to deal with cookies and sessions
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
// crypto - part of nodejs - no need to install
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');


// Using Passport Middleware - strategy name: local, and pass it our options
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Ошибка доступа!',
  successRedirect: '/',
  successFlash: 'Успешный логин!'
});


// Logout
exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Вы успешно вышли из системы!');
  res.redirect('/');
};

// Check if the user is logged in - and apply the rule to the routes that need authentication
exports.isLoggedIn = (req, res, next) => {
  // 1) PASSPORT method - Check if the user is authenticated
  if(req.isAuthenticated()) {
    next() //carry on! they are logged in!
    return;
  };
  req.flash('error', 'Требуется регистрация!');
  res.redirect('/login');
};

// Check if Admin!
exports.isAdmin = (req, res, next) => {
  if(req.isAuthenticated()) {
    if (req.user.email === process.env.ADMIN) {
      next() //carry on! they are logged in!
      return;
    }
  };
  req.flash('error', 'Требуются права администратора!');
  res.redirect('/login');
};

// Forgot password - form submit
exports.forgot = async (req, res) => {
  try {
    // 1. See if the user with that email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('error', 'Пользователь с данным email адресом не найден');
      return res.redirect('/login');
    }
    // 2. Set reset tokens and expiary on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; //1 hour from now
    await user.save();
    // 3. Send them an emial with their token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    await mail.send({
      user: user,
      subject: 'Восстановление пароля',
      resetURL: resetURL,
      filename: 'password-reset'
    });

    req.flash('success', `На ваш email была выслан ссылка для восстановления пароля.`);
    // 4. Redirect to login page
    res.redirect('/login');
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

//Submit Формы отправки email для восстановления пароля
exports.reset = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      // gt - greater than!
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      req.flash('error', 'Время действия ссылки истекло!');
      return res.redirect('/login');
    }
  // If there is a user -> show the reset password form!
  res.render('reset', { title: 'Обновить пароль' });
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

// Получил ссылку на замену пароля - проверили что пароли совпадают!
exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); //keep going!
    return; //stop the function from running
  }

  req.flash('error', 'Пароли не совпадают!');
  res.redirect('back');
};

exports.update = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      // Query mongoDb - greater than current time (now)
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Ошибка запроса или время действия ссылки истекло.');
      return res.redirect('/login');
    }

  // .setPassword method provided by "passportLocalMongoose" plugin that we added to our User model
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);

  //Get rid of fields that we don't need any more
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Save new data and get updated user
  const updatedUser = await user.save();
  // Auto log them in
  await req.login(updatedUser);

  req.flash('success', 'Пароль обновлен!');
  res.redirect('/');
  } catch (e) {
    res.render('error', {message:'Something went wrong'});
  }
};
