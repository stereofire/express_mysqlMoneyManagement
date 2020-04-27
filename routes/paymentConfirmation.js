// 支付确认页 paymentConfirmation 路由
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
  logger.info(pathname + 'get-paymentConfirmation');

  logger.info("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    // logger.info("req.query.orderNo:", req.query.orderNo); //输出req.query.orderNo:10000104
    // logger.info(typeof (req.query.orderNo));
    // var orderNo = req.query.orderNo;
    // var length = orderNo.length - 2;
    // orderNo = orderNo.substr(1, length); //－－－'hello world';
    // logger.info(orderNo);

    // var studentName = req.session.username;
    // var payResult = req.query.payResult;
    // var orderNo = req.query.orderNo;
    // logger.info(orderNo, payResult);
    // ejs.renderFile('./views/paymentConfirmation.ejs', {
    //   orderNo,
    //   payResult,
    //   studentName
    // }, function (err, data) {
    //   if (err) {
    //     logger.info(err);
    //   }
    //   res.end(data);
    // })

  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});
module.exports = router;