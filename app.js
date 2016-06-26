var port = process.env.PORT || 8080;
var express = require('express');
var morgan = require('morgan'); // loger
var mongoose = require('mongoose'); // object relational mapper connect mongodb and nodejs
var bodyParser = require('body-parser');
var ejs = require('ejs'); // view engine
var ejsMate = require('ejs-mate'); // ejs module to sove ejs redundance to enable partial icloude
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);// store session in mongoDB automatically remove expired sessions 
                                                        // pass in session to use express session defult is es6 but we are using 5
var passport = require('passport');

var secret = require('./config/secret');
var User = require('./models/user');
var categorySchema = require('./product/category');
var productSchema = require('./product/product');
var getNumInCart = require('./shopping_cart/getNumInCart');

// new express object
var app = express();

mongoose.connect(secret.database, function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('mongodb connected');
    }
});

// Add middleware
app.use(express.static(__dirname + '/public', { maxAge: 86400000 })); // serve static content with caching
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
    // set timeout 10mins
    cookie:{maxAge : 600000},
    // set store as mongoDB use mongoStore
    store: new MongoStore({url: secret.database, autoReconnect: true})
}));

app.use(flash());
// initialize passport
app.use(passport.initialize());
// serialize and deserialize
app.use(passport.session());
// set user object to global
app.use(function (req, res, next) {
    res.locals.user = req.user;
    productSchema.find({}, function (err, products) {
        if (err) {
            return next(err)
        };
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
// set ejs as view engine, templates saved in views
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

app.listen(port, function (error) {
    if (error) throw error;
    console.log("Server is listenning on port " + port);
});
