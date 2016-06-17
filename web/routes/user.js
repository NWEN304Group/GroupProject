var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');
var async = require('async');
var cartSchema = require('../models/cart');

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
    User.findOne({_id: req.user._id}, function (err, user) {
        if (err) return next(err);

        res.render('users/profile', {user: user});

    });
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
        function (user) {
            var cart = new cartSchema();
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

module.exports = router;