var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('./secret');
var User = require('../models/user');
var async = require('async');
var Cart = require('../shopping_cart/cart');

// serialize  user id to session
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

// deserialize user id and get user object and attach user to req.user
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Middleware
// name local-login
passport.use('local-login', new LocalStrategy({
  // email and password from post req
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
  User.findOne({facebook: profile.id}, function(err, user){
    if(err) return done(err);
    if(user){
      return done(null, user);
    }else {
      async.waterfall([
        function(callback){
          var newUser = new User();
          newUser.email = profile._json.email;
          newUser.facebook = profile.id;
          newUser.tokens.push({kind: 'facebook', token: token});
          newUser.profile.name = profile.displayName;
          newUser.save(function(err){
            if(err) throw err;
            callback(err, newUser);
          });
        },

        function(newUser){
          var cart = new Cart();
            cart.owner = newUser._id;
            cart.save(function (err) {
              if (err) return done(err);
              return done(err, newUser);
          });
        }

      ])
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
