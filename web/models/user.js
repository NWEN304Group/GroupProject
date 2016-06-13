var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
	email: { 
		type: String, unique: true, lowercase: true
	},

	password: String,

	address: String,

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

userSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

module.exports = mongoose.model('User', userSchema);