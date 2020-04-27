// 订单提交结果 orderSubmit 路由
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
  logger.info(pathname + 'get-orderSubmit');

  logger.info("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    // logger.info("req.query.keys:", req.query.keys); //输出req.query:[ 'goods0', 'goods1' ]
    // var keys = req.query.keys;
    var studentName= req.session.username;
    ejs.renderFile('./views/orderSubmit.ejs', {
    //   keys,
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
});
module.exports = router;