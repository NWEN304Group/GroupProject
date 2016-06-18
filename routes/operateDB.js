/**
 * Created by Zhen Wang on 16/6/16.
 * this js is created for operating database, requests
 * in this file can only be called by seller. User should not
 * be allowed to use request in this class
 */

var router = require('express').Router();
var Category = require('../product/category');

// //return add category page
// router.get('/addCategory', function(req, res, next) {
//     res.render('operateDB/addCategoryPage', { message: req.flash('success') });
// });
//
// //add to database
// router.post('/addCategory', function(req, res, next) {
//     var category = new Category();
//     category.name = req.body.nameInput;
//
//     category.save(function(err) {
//         if (err) return next(err);
//         req.flash('success', 'Adding category success');
//         return res.redirect('/addCategory');
//     });
// })

module.exports = router;

