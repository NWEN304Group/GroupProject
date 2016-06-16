var router = require('express').Router();

router.get('/', function (req, res) {
    res.render('main/index');
});

//get products from id of category
router.get('/products/:id', function (req, res, next) {
    console.log(req);
    //search in mongodb
    Product
        .find({category: req.params.id})
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            res.render('main/productsOfCategory', {
                products: products
            });
        });
});
// test id 57623034ec93478e42015cfb


module.exports = router;
