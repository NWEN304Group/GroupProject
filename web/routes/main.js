var router = require('express').Router();
var product = require('../product/product')
var Cart = require('../shopping_cart/cart');

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
            if (err) return next(err);
            res.render('product/productsOfCategory', {
                productsFound: products
            });
        });
});
// test id 57623034ec93478e42015cfb

//get a product by id
router.get('/product/:product_id', function (req, res, next) {
    product.findById({_id: req.params.product_id}, function (err, productFound) {
        if (err) return next(err);
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
                cart.items.pull({_id:cart.items[i]._id});
                cart.items.push({
                    item: newitem,
                    price: newprice,
                    quantity: newquantity
                });
            }
        }
        if (booleanVaule == 0) {
            cart.items.push({
                item: req.body.product_id,
                price: parseFloat(req.body.priceValue),
                quantity: parseInt(req.body.quantity)
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

//==================================================================

module.exports = router;
