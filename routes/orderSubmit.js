// 订单提交结果 orderSubmit 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-orderSubmit');

  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    // console.log("req.query.keys:", req.query.keys); //输出req.query:[ 'goods0', 'goods1' ]
    // var keys = req.query.keys;
    var studentName= req.session.username;
    ejs.renderFile('./views/orderSubmit.ejs', {
    //   keys,
      studentName
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