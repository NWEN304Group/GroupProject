var router = require('express').Router();
var product = require('../product/product')

router.get('/', function (req, res, next) {
    if (req.user) {
        var productsInOnePage = 6;
        var page = req.params.page;
        product.find()
            .skip(productsInOnePage * (page-1))
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
            .skip(productsInOnePage * (page-1))
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

//get products from id of one category
router.get('/products/:id', function (req, res, next) {
    //search in mongodb
    product
        .find({category: req.params.id})
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
router.get('/product/:id', function (req, res, next) {
    product.findById({_id: req.params.id}, function (err, productFound) {
        if (err) return next(err);
        res.render('product/oneProductPage', {
            productFound: productFound
        });
    });
});

router.get('/page/:page', function (req, res, next) {
    var productsInOnePage = 6;
    var page = req.params.page;
    product.find()
        .skip(productsInOnePage * (page-1))
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
        .skip(productsInOnePage * (page-1))
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


module.exports = router;
