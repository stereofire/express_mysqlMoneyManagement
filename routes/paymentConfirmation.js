// 支付确认页 paymentConfirmation 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-paymentConfirmation');

  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    console.log("req.query.orderNo:", req.query.orderNo); //输出req.query.orderNo:10000104
    console.log(typeof (req.query.orderNo));
    var orderNo = req.query.orderNo;
    var length = orderNo.length - 2;
    orderNo = orderNo.substr(1, length); //－－－'hello world';
    console.log(orderNo);
    ejs.renderFile('./views/paymentConfirmation.ejs', {
      orderNo
    }, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
});
module.exports = router;