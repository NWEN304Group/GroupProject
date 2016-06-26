var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');
var async = require('async');
var cartDB = require('../shopping_cart/cart');
var product = require('../product/product')

router.get('/login', function (req, res) {
    if (req.user) return res.redirect('/');
    res.render('users/login', {message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

// login api passin: email password
router.post('/api/login', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ email: email}, function(err, user){
        if (err) return res.status(500).send('Database fail');
        if (!user) return res.status(401).send('User not found');
        if (!user.varifyPassword(password)) return res.status(401).send('Password wrong');
        passport.authenticate('local-login');
        return res.status(200).send('success');
    })
});

router.get('/profile', function (req, res, next) {
    if (req.user) {
        //var recomandproduct;
       // var recomandproducts;
        //var lengthvar = 0;
        //find recomand category
        var bestcategory = -1;
        var maxcount = 0;

        for (var j = 0; j < req.user.recomandCounter.length; j++) {
            if (req.user.recomandCounter[j].quantity > maxcount) {
                bestcategory = req.user.recomandCounter[j].category;
            }
        }
       // console.log(bestcategory);
        if (bestcategory == -1) {
            console.log(recomandproduct);
            User.findOne({_id: req.user._id}).populate('history.item')
                .exec(function (err, user) {
                    // Weather based recommendation
                    if(user.profile.weather.text){
                        product.find({weather: user.profile.weather.code})
                            .exec(function (err, products) {
                                if (err) return next(err);

                                    res.render('users/profile', {user: user, products: products,recomandproduct:-1});

                            });
                    }else {

                            res.render('users/profile', {user: user, products: undefined,recomandproduct:-1});

                    }
                });
        }
        else{
            //get a product from reconmand category
            product
                .findOne({category: bestcategory})
                .populate('category')
                .exec(function (err, recomandproduct) {
                    if (err) return next(err);
                    // lengthvar=products.length;
                    //recomandproducts=products;
                    console.log(recomandproduct);

                    User.findOne({_id: req.user._id}).populate('history.item')
                        .exec(function (err, user) {
                            // Weather based recommendation
                            if(user.profile.weather.text){
                                product.find({weather: user.profile.weather.code})
                                    .exec(function (err, products) {
                                        if (err) return next(err);
                                        res.render('users/profile', {user: user, products: undefined,recomandproduct:recomandproduct});
                                    });
                            }else {
                                res.render('users/profile', {user: user, products: undefined,recomandproduct:recomandproduct});
                            }
                        });
                });

            //var index =Math.ceil( Math.random(lengthngthvar));
            //recomandproduct=recomandproducts[index];
        }


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
            // if email already exist then decline the singup
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
            });
        }
    ])
});

// signup api
router.post('/api/signup', function (req, res, next) {
    async.waterfall([
        function (callback) {
            var user = new User();

            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;
            // if email already exist then decline the singup
            User.findOne({email: req.body.email}, function (err, existingUser) {

                if (existingUser) {
                    return res.status(401).send('Account with that email address already exists');
                } else {
                    user.save(function (err, user) {
                        if (err) return res.status(500).send('Database fail');
                        res.status(200).send('User created success');
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
                if (err) res.status(500).send('Database fail');
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

// Set weather to user for products recommendation.
router.post('/weather', function(req, res, next){
  var weather = req.body.weather;
  var wcode = req.body.wcode;
  if (!req.user) return;
  User.findOne({ _id: req.user._id }, function(err, user) {

    if (err) return next(err);

    if(weather) {
        user.profile.weather.text = weather;
        user.profile.weather.code = wcode;
    }
    user.save(function(err) {
    if (err) return next(err);
    });
  });
  res.status(200).send('OK');
});

module.exports = router;