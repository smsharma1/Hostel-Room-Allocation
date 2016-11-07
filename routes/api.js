var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('Users');
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
    return res.redirect('/');
};

//Register the authentication middleware
router.use('/preference', isAuthenticated);

router.post('/preference', function (req, res) {
  User.find({ "username": req.body.username }, function (err, data) {
    return res.json({
      "name": data[0].name,
      "hall": data[0].hall,
      "prevRoom": data[0].prevRoom,
      "priority": data[0].priority
    });
  })
});

router.put('/preference', function (req, res) {
  User.findOneAndUpdate({ "username": req.body.username }, { $set: { priority: req.body.priority } },
    function (err, data) {
      if (err) return res.send(err);
      return res.send(data);
    })
});


module.exports = router;
