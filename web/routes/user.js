var router = require('express').Router();
var User = require('../models/user');

router.post('/signup', function(req, res, next){
	var user = new User();
	user.profile.name = req.body.name;
	user.password = req.body.password;
	user.email = req.body.email;

	User.findOne({ email: req.body.email}, function(error, isExisting){
		if(isExisting){
			console.log(req.body.email + ' already exist.');
			return res.redirect('/signup');
		} else{
			user.save(function(error){
				if(error) return next(error);
				res.json('Sucessfuly create a new user!');
			});
		}
	});	
});

module.exports = router;