// 订单确认页 orderConfirm 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'get-orderConfirm');

  logger.info("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    logger.info("req.query.keys:", req.query.keys); //输出req.query:[ 'goods0', 'goods1' ]
    var keys = req.query.keys;
    var studentName = req.session.username;
    ejs.renderFile('./views/orderConfirm.ejs', {
      keys,
      studentName
    }, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
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
  //   logger.info(object);

  // var a = req.getParameterValues("keys");
  // logger.info(a);
  // var list = JSON.parse(req.body.keys);
  // logger.info(list);
});

/* 获取用户提交的订单信息. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'post-orderConfirm');
  logger.info("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取订单信息*/
    logger.info('get orders FormData Params: ', req.body);
    var submitData = req.body.submitData;
    var ordersObj = JSON.parse(submitData);
    logger.info("get submitDataObj:", ordersObj);
    /*提交订单信息到数据库*/
    var account = req.session.user;
    userDao.querySubmitOrder(account, ordersObj, res, req); //function (json) {
    
  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
        res.send("登录超时刷新失败");
      }
      res.end(data);
    })
  }
});
module.exports = router;