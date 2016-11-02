var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('Users');
/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index');
});*/

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods
    if(req.method === "GET"){
        return next();
    }
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/login', isAuthenticated);

router.post('/login', function(req, res){
  User.find({"login":req.body.login },function (err, data) {
    return res.json( {
          "name": data[0].name,
          "hall": data[0].hall,
          "prevRoom": data[0].prevHall,
          "priority": data[0].priority
        });
  })
});

router.post('/update', function(req, res){
  User.findOneAndUpdate({"login":req.body.login },{"priority":req.body.priority},function (err, data) {
    return res.json({"success": true});
  })
});


module.exports = router;
