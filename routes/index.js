var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('Users');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/login', function(req, res){
  User.find({"login":req.body.login },function (err, data) {
    if (data.length > 0){
      if (data[0].password == req.body.password){
        var temp = {
          "name": data[0].name,
          "hall": data[0].hall,
          "prevRoom": data[0].prevHall,
          "priority": data[0].priority
        };
        return res.json({"user": true, "pass":true, "data":temp});
      }
      return res.json({"user": true, "pass":false});
    }
    return res.json({"user":false});
  })
});

module.exports = router;
