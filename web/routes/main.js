var router = require('express').Router();
var product = require('../product/product')

router.get('/', function (req, res) {
    res.render('main/index');
});

//get products from id of category
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


module.exports = router;
