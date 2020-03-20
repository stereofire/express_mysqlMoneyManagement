// 支付结果页 paymentResult 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-paymentResult');

  console.log("已登录用户查询：", req.session.islogin);
  var studentName= req.session.username;
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    ejs.renderFile('./views/paymentResult.ejs', {studentName}, function (err, data) {
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