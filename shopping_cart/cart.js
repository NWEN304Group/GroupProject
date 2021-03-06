/**
 * Created by Zhen Wang on 16/6/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CartSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    total: { type: Number, default: 0},
    items: [{
        item: { type: Schema.Types.ObjectId, ref: 'Product'},
        quantity: { type: Number, default: 1},
        price: { type: Number, default: 0},
        category:{type: Schema.Types.ObjectId, ref: 'Category'}
    }]
});

module.exports = mongoose.model('Cart', CartSchema);
