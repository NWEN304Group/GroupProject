var router = require('express').Router();
var User = require('../models/user');

router.get('/signup', function(req, res, next){
	res.render('users/signup');
});

router.post('/signup', function(req, res, next){
	var user = new User();
	user.profile.name = req.body.name;
	user.password = req.body.password;
	user.email = req.body.email;

	User.findOne({ email: req.body.email}, function(error, isExisting){
		if(isExisting){
			req.flash('error','account already exist');
			return res.redirect('/signup');
		} else{
			user.save(function(error){
				if(error) return next(error);
				return res.redirect('/');
			});
		}
	});	
});

module.exports = router;