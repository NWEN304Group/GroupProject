var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

// User schema attributes
var userSchema = new mongoose.Schema({
	// key of users
	email: { 
		type: String, unique: true, lowercase: true
	},

	password: String,

	facebook: String,

	tokens: Array,

	address: {
		type: String, default: ''
	},

	profile: {
		name: {type: String, default: ''},
		weather: {text: String, code: Number}
	},
	history: [{
		paid: { type: Number, default: 0},
		// quantiry:{type:},
		quantity:{type:Number, default: 0},
		item: { type: Schema.Types.ObjectId, ref: 'Product'}
	}],
	recomandCounter:[{
		category:{type: Schema.Types.ObjectId, ref: 'Category'},
		quantity:{type:Number, default: 0}
	}]
});

userSchema.pre('save', function(next){
	// Other wise hash function will not work
	var user = this;
	if(!user.isModified('password')) return next();

	bcrypt.genSalt(10, function(err, salt){
		if(err) return next(err);
		bcrypt.hash(user.password, salt, null, function(err, hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.varifyPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);