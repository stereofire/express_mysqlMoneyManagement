// 支付结果页 paymentResult 路由
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
  logger.info(pathname + 'get-paymentResult');

  logger.info("已登录用户查询：", req.session.islogin);
  var studentName = req.session.username;
  var payResult = req.query.payResult;
  var orderNo = req.query.orderNo;
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    if(payResult=="支付成功"){
      userDao.queryPaySuccRe(res,req);
    }else{
      userDao.queryPayFailRe(res,req);
    }
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