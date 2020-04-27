// 缴费订单管理页 TallOrdersAdmin 路由
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
  logger.info(pathname + 'get-TallOrdersAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.TdeleteOrder == undefined) {
      userDao.queryTallOrders(req.session.user,res,req);
    }else{
      logger.info("删除缴费记录：", req.query.TdeleteOrder);
      userDao.TdeleteOrder(res, req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});
router.post('/', function (req, res, next) {
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.querySiftAllOrders == "true") {
      logger.info('进入TcorpInfoAdmin?querySiftAllOrders=true，get FormData Params: ', req.body);
      /*筛选缴费订单*/
      userDao.querySiftAllOrders(res,req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});
module.exports = router;