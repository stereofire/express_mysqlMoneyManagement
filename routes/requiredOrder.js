// 必缴订单页 requiredOrder 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    console.log(method);
    var pathname = url.parse(req.url, true).pathname;
    console.log(pathname + 'get-requiredOrder');
    ejs.renderFile('./views/requiredOrder.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  });
module.exports = router;