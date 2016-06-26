var router = require('express').Router();
var product = require('../product/product')
var Cart = require('../shopping_cart/cart');
var async = require('async');
var User = require('../models/user');

router.get('/', function (req, res, next) {
    if (req.user) {
        var productsInOnePage = 6;
        var page = req.params.page;
        product.find()
            .skip(productsInOnePage * (page - 1))
            .limit(productsInOnePage)
            .populate('category')
            .exec(function (err, products) {
                if (err) return next(err);
                product.count().exec(function (err, count) {
                    if (err) return next(err);
                    var num = Math.ceil(count / productsInOnePage);
                    res.render('product/productsHomePage', {
                        products: products,
                        numOfPage: num
                    });
                });
            });
    } else {
        var productsInOnePage = 6;
        var page = req.params.page;
        product.find()
            .skip(productsInOnePage * (page - 1))
            .limit(productsInOnePage)
            .populate('category')
            .exec(function (err, products) {
                if (err) return next(err);
                product.count().exec(function (err, count) {
                    if (err) return next(err);
                    var num = Math.ceil(count / productsInOnePage);
                    res.render('main/index', {
                        products: products,
                        numOfPage: num
                    });
                });
            });
    }
});

//==============================product ===============================

//get products from id of one category
router.get('/products/:category_id', function (req, res, next) {
    //search in mongodb
    product
        .find({category: req.params.category_id})
        .populate('category')
        .exec(function (err, products) {
            if (err) {
                res.status(500).render('error_handle/errorpage',{error:err,message:"Internal Server Error"});
                return;
            }
            res.render('product/productsOfCategory', {
                productsFound: products
            });
        });
});
// test id 57623034ec93478e42015cfb

//get a product by id
router.get('/product/:product_id', function (req, res, next) {
    product.findById({_id: req.params.product_id}, function (err, productFound) {
        if (err) res.statu(404).send("page not founf");
        res.render('product/productPage', {
            productFound: productFound
        });
    });
});

router.get('/page/:page', function (req, res, next) {
    var productsInOnePage = 6;
    var page = req.params.page;
    product.find()
        .skip(productsInOnePage * (page - 1))
        .limit(productsInOnePage)
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            product.count().exec(function (err, count) {
                if (err) return next(err);
                var num = Math.ceil(count / productsInOnePage);
                res.render('product/productsHomePage', {
                    products: products,
                    numOfPage: num
                });
            });
        });
});

router.get('/pagenotlogin/:page', function (req, res, next) {
    var productsInOnePage = 6;
    var page = req.params.page;
    product.find()
        .skip(productsInOnePage * (page - 1))
        .limit(productsInOnePage)
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            product.count().exec(function (err, count) {
                if (err) return next(err);
                var num = Math.ceil(count / productsInOnePage);
                res.setHeader('Cache-Control','max-age=200');
                res.render('main/index', {
                    products: products,
                    numOfPage: num
                });
            });
        });
});

//=======================shopping cart===========================

//add product to user's cart and update cart
router.post('/product/:product_id', function (req, res, next) {
    //find user's cart from db
    Cart.findOne({owner: req.user._id}, function (err, cart) {
        //add product to cart
        var booleanVaule = 0;
        for (var i = 0; i < cart.items.length; i++) {
            // console.log(cart.items[i].item);
            // console.log(req.body.product_id);
            if (cart.items[i].item == req.body.product_id) {
                booleanVaule = 1;

                var newquantity = parseInt(cart.items[i].quantity) + parseInt(req.body.quantity);
                var newprice = parseFloat(cart.items[i].price) + parseFloat(req.body.priceValue);
                var newitem = cart.items[i].item;

                //update db
                // cart.update({'items.item': req.body.product_id}, {
                //         '$set': {
                //             'items.$.quantity': newquantity,
                //             'items.$.price': newprice
                //         }
                //     }, function (err, item) {
                //
                //     }
                // );
                cart.items.pull({_id: cart.items[i]._id});
                cart.items.push({
                    item: newitem,
                    price: newprice,
                    quantity: newquantity,
                    category:req.body.category
                });
            }
        }
        if (booleanVaule == 0) {
            cart.items.push({
                item: req.body.product_id,
                price: parseFloat(req.body.priceValue),
                quantity: parseInt(req.body.quantity),
                category:req.body.category
            });
        }
        //update total
        cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);


        cart.save(function (err) {
            if (err) return next(err);
            return res.redirect('/cart');
        });

    });
});

//response : cart page, cartFound,message
router.get('/cart', function (req, res, next) {
    if (req.user)
    //find user's cart from db
        Cart
            .findOne({owner: req.user._id})
            .populate('items.item')
            .exec(function (err, cartFound) {
                if (err) return next(err);
                res.render('cart/cart', {
                    cartFound: cartFound,
                    message: req.flash('remove')
                });
            });
    else {
        res.render('users/login', {message: req.flash('loginMessage')});
    }
});

router.post('/removeall', function (req, res, next) {
    Cart.findOne({owner: req.user._id}, function (err, cartFound) {

        cartFound.items.pull(String(req.body.item));

        cartFound.total = (cartFound.total - parseFloat(req.body.price)).toFixed(2);

        cartFound.save(function (err, found) {
            if (err) return next(err);
            req.flash('remove', 'Successfully removed');
            res.redirect('/cart');
        });
    });
});

router.post('/removeone', function (req, res, next) {
    Cart.findOne({owner: req.user._id}, function (err, cartFound) {
        for (var i = 0; i < cartFound.items.length; i++) {
            if (cartFound.items[i]._id == req.body.item) {
                console.log(cartFound.items[i].quantity);
                if (cartFound.items[i].quantity == 1) {
                    cartFound.items.pull(String(req.body.item));
                    cartFound.total = cartFound.total - parseFloat(req.body.price);
                }
                else {
                    var quantityValue = parseInt(cartFound.items[i].quantity);
                    var priceValue = parseFloat(cartFound.items[i].price);
                    var unitPrice = priceValue / quantityValue;
                    console.log(unitPrice + "unitPrice");
                    var newquantity = quantityValue - 1;
                    var newprice = priceValue - unitPrice;
                    var newitem = cartFound.items[i].item;

                    //update db
                    cartFound.items.pull({_id: cartFound.items[i]._id});
                    cartFound.items.push({
                        item: newitem,
                        price: newprice,
                        quantity: newquantity
                    });
                    cartFound.total = cartFound.total - unitPrice;
                }
            }
        }

        cartFound.save(function (err, found) {
            if (err) return next(err);
            req.flash('remove', 'Successfully removed');
            res.redirect('/cart');
        });
    });
});

//=============================payment==============================
router.get('/payment', function (req, res, next) {
    async.waterfall([
        function (callback) {
            Cart.findOne({owner: req.user._id}, function (err, cart) {
                callback(err, cart);
            });
        },
        function (cart, callback) {
            User.findOne({_id: req.user._id}, function (err, user) {
                if (user) {

                    for (var i = 0; i < cart.items.length; i++) {
                        //add to purchase history
                        user.history.push({
                            item: cart.items[i].item,
                            paid: cart.items[i].price,
                            quantity: cart.items[i].quantity
                        });
                        //update recomndaCounter
                        var added =0;
                        //update quantity if category exist
                       for(var j=0;j<user.recomandCounter.length;j++){
                           if(user.recomandCounter[j].category._id==cart.items[i].category._id){
                               user.recomandCounter[j].quantity+=cart.items[i].quantity;
                               added =1;
                           }
                       }
                        //add new category if no exist
                        if(added==0){
                            user.recomandCounter.push(
                                {
                                    category:cart.items[i].category,
                                    quantity:cart.items[i].quantity
                                }
                            );
                        }
                    }

                    user.save(function (err, user) {
                        if (err) return next(err);
                        callback(err, user);
                    });
                }
            });
        },
        function (user) {
            //empty items in cart
            Cart.update({owner: user._id}, {$set: {items: [], total: 0}}, function (err, updated) {
                if (updated) {
                    //redirect
                    res.redirect('/profile');
                }
            });
        }
    ]);
});

//==================================================================

module.exports = router;
