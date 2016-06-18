/**
 * Created by Zhen Wang on 16/6/15.
 * category schema
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: { type: String, unique: true, lowercase: true}
});

module.exports = mongoose.model('Category', CategorySchema);

