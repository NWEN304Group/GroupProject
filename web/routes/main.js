var router = require('express').Router();

router.get('/', function(req, res){
	res.render('main/index');
});

module.exports = router;