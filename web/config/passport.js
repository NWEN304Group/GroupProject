var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('./secret');
var User = require('../models/user');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Middleware
// name local-login
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {// validate input
  User.findOne({ email: email}, function(err, user) {
    if (err) return done(err);

    if (!user) {
      return done(null, false, req.flash('loginMessage', 'No user has been found'));
    }

    if (!user.varifyPassword(password)) {
      return done(null, false, req.flash('loginMessage', 'Wrong Password'));
    }
    return done(null, user);
  });
}));

passport.use(new FacebookStrategy(secret.facebook, function(token, refreshToken, profile, done){
  User.findOne({facebook: profile.id}, function(error, user){
    if(error) return done(error);
    if(user){
      return done(null, user);
    }else {
      var newUser = new User();
      newUser.email = profile._json.email;
      newUser.facebook = profile.id;
      newUser.tokens.push({kind: 'facebook', token: token});
      newUser.profile.name = profile.displayName;
      newUser.save(function(error){
        if(error) throw error;
        return done(null, newUser);
      });
    }
  });
}));

//custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
