/**
 * Created by Zhen Wang on 16/6/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    category: {type: Schema.Types.ObjectId, ref: 'Category'},
    name: String,
    price: Number,
    image: String
});

module.exports = mongoose.model('Product', ProductSchema);

// for adding product in database
// 57623034ec93478e42015cfb id of food
// 57623034ec93478e42015cfc id of shoes
