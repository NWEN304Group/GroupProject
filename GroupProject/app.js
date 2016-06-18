var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');

var secret = require('./config/secret');
var User = require('./models/user');
var categorySchema = require('./product/category');
var productSchema = require('./product/product');
var getNumInCart = require('./shopping_cart/getNumInCart');

var app = express();

mongoose.connect(secret.database, function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('mongodb connected');
    }
});

// Add middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({url: secret.database, autoReconnect: true})
}));

app.use(flash());
// initialize passport
app.use(passport.initialize());
// serialize and deserialize
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    productSchema.find({}, function (err, products) {
        if (err) {
            return next(err)
        }
        ;
        res.locals.allProducts = products;
        next();
    })
});

//select all categories
app.use(function (req, res, next) {
    categorySchema.find({}, function (err, categories) {
        if (err) {
            return next(err)
        }
        ;
        res.locals.allCategories = categories;
        next();
    })
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

// Add Routes------------
var mainRoute = require('./routes/main');
var userRoute = require('./routes/user');
var operateDBRoute = require('./routes/operateDB');

app.use(mainRoute);
app.use(userRoute);
app.use(operateDBRoute);
//-----------------------

//shoping cart
app.use(getNumInCart);

app.listen(secret.port, function (error) {
    if (error) throw error;
    console.log("Server is listenning on port " + secret.port);
});
