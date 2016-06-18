var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');
var async = require('async');
var cartDB = require('../shopping_cart/cart');

router.get('/login', function (req, res) {
    if (req.user) return res.redirect('/');
    res.render('users/login', {message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/profile', function (req, res, next) {
    if (req.user) {
        User.findOne({_id: req.user._id}).populate('history.item')
            .exec(function (err, user) {
                if (err) return next(err);
                res.render('users/profile', {user: user});
            })
        ;
    }
    else {
        res.render('users/login', {message: req.flash('loginMessage')});
    }
});

router.get('/signup', function (req, res, next) {
    if (req.user) return res.redirect('/');
    res.render('users/signup', {
        errors: req.flash('errors')
    });
});

router.post('/signup', function (req, res, next) {
    async.waterfall([
        function (callback) {
            var user = new User();

            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;

            User.findOne({email: req.body.email}, function (err, existingUser) {

                if (existingUser) {
                    req.flash('errors', 'Account with that email address already exists');
                    return res.redirect('/signup');
                } else {
                    user.save(function (err, user) {
                        if (err) return next(err);
                        callback(null, user);
                    });
                }
            });
        },
        //new a cart and link to user in db
        function (user) {
            var cart = new cartDB();
            cart.owner = user._id;
            cart.save(function (err) {
                if (err) return next(err);
                req.logIn(user, function (err) {
                        if (err) return next(err);
                        res.redirect('/profile');
                    }
                )
            })
        }
    ])
});


router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/edit-profile', function (req, res, next) {
    res.render('users/edit-profile', {message: req.flash('success')});
});

router.post('/edit-profile', function (req, res, next) {
    User.findOne({_id: req.user._id}, function (err, user) {

        if (err) return next(err);

        if (req.body.name) user.profile.name = req.body.name;
        if (req.body.address) user.address = req.body.address;

        user.save(function (err) {
            if (err) return next(err);
            req.flash('success', 'Successfully Edited your profile');
            return res.redirect('/edit-profile');
        });
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

//Set weather to user for products recommendation.
router.put('/weather/:weather', function(req, res, next){
  var weather = req.params.weather;
  if (!req.user) return;
  User.findOne({ _id: req.user._id }, function(err, user) {

    if (err) return next(err);

    if(weather) user.profile.weather = weather;

    user.save(function(err) {
    if (err) return next(err);
    });
  });
  console.log(weather);
  res.status(200).send('OK');
});

module.exports = router;