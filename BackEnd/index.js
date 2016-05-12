/**
 * web services
 */
var express = require('express');
var app = express();
var port = process.env.PORT||8080;
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(function(req, res, next) {
    if (req.headers.origin) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
        res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
        if (req.method === 'OPTIONS') return res.send(200)
    }
    next();
})
//database
var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL;// please change this if using on lab computer
var client = new pg.Client(connectionString);
client.connect();

//log start
console.log("start");

//==========interfaces======================================
//send html file to client
app.get('/', function (req, res) {
    //error handling
    req.on('error',function(err){
        res.send(401,{message:"bad request"});
    });

    res.sendFile(200,{html:"./FrontEnd/index.html"});
});

//not sure we need it
//
// //get data from database
// app.get('/initialize', function (req, res) {
//     //error handling
//     req.on('error',function(err){
//         res.send(401,{message:"bad request"});
//     });
// });

//log in,user can only log in one time
//customer name is the id in database, so customer id is unique
//will use OAuth
app.get('/login', function (req, res) {
    //error handling
    req.on('error',function(err){
        res.send(401,{message:"bad request"});
    });

    //get value of variable
    var customerid = req.body.customerid;//customer id is name of customer 
    var passward = req.body.password;

    //===================================================
    // web should already check this, just leave these, will delete later
    //error handling
    if(customerid==null){
        console.log("Error: fail to login - miss customerid");
        res.status(401).send({message:"Error:miss customerid"});
        return;
    }
    if(passward==null){
        console.log("Error: fail to login - miss passward");
        res.status(401).send({message:"Error:miss passward"});
        return;
    }
    //====================================================

    //check whether the customer is registered.


});

//set port listen
app.listen(port, function () {
    console.log('"to-do list" app listening on port'+port+'!');
});