// 订单确认页 orderConfirm 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-orderConfirm');

  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    console.log("req.query.keys:", req.query.keys); //输出req.query:[ 'goods0', 'goods1' ]
    var keys = req.query.keys;
    var studentName = req.session.username;
    ejs.renderFile('./views/orderConfirm.ejs', {
      keys,
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
  //   var URL = decodeURI(location.search); //?id="123456"&Name="bicycle";
  //     var object = {};
  //     if(URL.indexOf("?") != -1)//url中存在问号，也就说有参数。  
  //     {   
  //       var str = URL.substr(1);  //得到?后面的字符串
  //       var strs = str.split("&");  //将得到的参数分隔成数组[id="123456",Name="bicycle"];
  //       for (var i = 0; i < strs.length; i++) {
  //         object[strs[i].split("=")[0]] = strs[i].split("=")[1]
  //       }
  // 　　}
  //   console.log(object);

  // var a = req.getParameterValues("keys");
  // console.log(a);
  // var list = JSON.parse(req.body.keys);
  // console.log(list);
});

/* 获取用户提交的订单信息. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'post-orderConfirm');
  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取订单信息*/
    console.log('get orders FormData Params: ', req.body);
    var submitData = req.body.submitData;
    var ordersObj = JSON.parse(submitData);
    console.log("get submitDataObj:", ordersObj);
    /*提交订单信息到数据库*/
    var account = req.session.user;
    userDao.querySubmitOrder(account, ordersObj, res, req); //function (json) {
    
  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
        res.send("登录超时刷新失败");
      }
      res.end(data);
    })
  }
});
module.exports = router;