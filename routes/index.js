var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('Users');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/user', function(req, res){
  User.find({"login":req.body.login, "password": req.body.password },function (err, data) {
    return res.json({"data":data, "error":err});
  })
});

module.exports = router;
