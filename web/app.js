var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');

var User = require('./models/user');

var app = express();
var databaseUrl = 'mongodb://root:qw12er34@ds019053.mlab.com:19053/nwen304test';
mongoose.connect(databaseUrl, function(error){
	if(error){
		console.log(error);
	}else{
		console.log('connected to mongodb');
	}
});

// Add middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Routes
var mainRoute = require('./routes/main');
var userRoute = require('./routes/user');

app.use(mainRoute);
app.use(userRoute);




app.listen(8080, function(error){
	if (error) throw error;
	console.log("Server is listenning on port 8080");
});