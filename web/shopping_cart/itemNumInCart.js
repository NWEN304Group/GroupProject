/**
 * Created by Zhen Wang on 16/6/17.
 * get the number of items in cart
 */
var cartDB = require('../shopping_cart/cart');

module.exports = function(req, res, next) {

    if (req.user) {
        var total = 0;
        cartDB.findOne({ owner: req.user._id }, function(err, cart) {
            if (cart) {
                for (var i = 0; i < cart.items.length; i++) {
                    total += cart.items[i].quantity;
                }
                res.locals.itemNumCart = total;
            } else {
                res.locals.itemNumCart = 0;
            }
            next();
        })
    } else {
        next();
    }
}
