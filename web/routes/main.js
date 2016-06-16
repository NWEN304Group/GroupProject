var router = require('express').Router();

router.get('/', function (req, res) {
    res.render('main/index');
});

//get product from id
router.get('/products/:id', function (req, res, next) {
    //search in mongodb
    Product
        .find({category: req.params.id})
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            res.render('main/category', {
                products: products
            });
        });
});


module.exports = router;
