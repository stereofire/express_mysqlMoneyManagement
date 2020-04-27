// 批量创建必缴订单——选择学号 TcreatOrdersInBatches_CStu 路由
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
  logger.info(pathname + 'get-TcreatOrdersInBatches_CStu');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    userDao.queryTcreatOrdersInBatches_CStu(res, req);
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});

/* 获取教师提交的学生学号. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'post-TcreatOrdersInBatches_CStu');
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.islogin);
    if (req.query.queryStuInfo == "true") {
      logger.info('进入TcreatOrdersInBatches_CStu?queryStuInfo=true，get FormData Params: ', req.body.submitData);
      userDao.queryTcreatOrdersInBatches_CStu(res, req);
    } else if (req.query.querySiftStuInfo_CStu == "true") {
      logger.info('进入TcreatOrdersInBatches_CStu?querySiftStuInfo_CStu=true，get FormData Params: ', req.body.submitData);
      userDao.querySiftStuInfo_CStu(res, req);
    } else {
      /*获取学号信息*/
      logger.info('get orders FormData Params: ', req.body);
      var submitData = req.body.submitData;
      var ordersObj = JSON.parse(submitData);
      logger.info("get submitDataObj:", ordersObj);
      /*提交商品信息、学号信息到数据库*/
      var account = req.session.user;
      userDao.querySubmitOrder(account, ordersObj, res, req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
        res.send("登录超时刷新失败");
      }
      res.end(data);
    })
  }
});
module.exports = router;