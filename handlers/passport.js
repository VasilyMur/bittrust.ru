const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// passport-local-mongoose adds a helper method createStrategy as static method to your schema.
// The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
