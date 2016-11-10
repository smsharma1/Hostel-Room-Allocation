var express = require('express');
var router = express.Router();
var _ = require('lodash');
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
      "friendPriority": data[0].friendPriority,
      "roomPriority": data[0].roomPriority,
      "noise": data[0].noise,
      "light": data[0].light
    });
  })
});

router.put('/preference', function (req, res) {
  var temp = 0;
  if( req.body.light){ temp = 1; }
  User.findOneAndUpdate({ "username": req.body.username }, { $set: { 
    friendPriority: req.body.friendPriority,
    roomPriority: req.body.roomPriority,
    noise: req.body.noise,
    light: temp
   } },
    function (err, data) {
      if (err) return res.send(err);
      return res.send(data);
    })
});

router.get('/users/:username', function(req, res){
  User.find({},function (err, data) {
    var usersList = [];
    _.forEach(data, function (value) {
      if(value.username != req.params.username) {
        usersList.push(value.username);
      }
    });
    return res.send(usersList);
  })
});

router.get('/rooms', function(req, res){
  User.find({},function (err, data) {
    var roomsList = [];
    _.forEach(data, function (value) {
      roomsList.push(value.prevRoom);
    });
    return res.send(_.uniq(roomsList));
  })
});

router.get('/stable', function (req, res) {
  var spawn = require("child_process").spawn;
  var process = spawn('python2', ["test1.py"]);
  User.find({}, function (err, data) {
    var pairs = {};
    _.forEach(data, function (value) {
      if (!_.has(pairs, value.roomie)) {
        pairs[value.username] = value.roomie;
      }
    });
    return res.send(pairs);
  })
});

router.get('/hung', function (req, res) {
  var spawn = require("child_process").spawn;
  var process = spawn('python2', ["hungarian.py"]);
  User.find({}, function (err, data) {
    var pairs = {};
    _.forEach(data, function (value) {
      if (!_.has(pairs, value.roomie)) {
        pairs[value.username] = value.finalRoom;
      }
    });
    return res.send(pairs);
  })
})

module.exports = router;
