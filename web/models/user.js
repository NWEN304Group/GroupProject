var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
	email: { 
		type: String, unique: true, lowercase: true
	},

	password: String,

	address: {
		type: String, default: ''
	},

	profile: {
		name: {type: String, default: ''}
	}
});

userSchema.pre('save', function(next){
	// Other wise hash function will not work
	var user = this;
	if(!user.isModified('password')) return next();

	bcrypt.genSalt(10, function(error, salt){
		if(error) return next(error);
		bcrypt.hash(user.password, salt, null, function(error, hash){
			if(error) return next(error);
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.varifyPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);