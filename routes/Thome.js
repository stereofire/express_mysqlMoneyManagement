// 教师首页 Thome (导航)路由
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
  logger.info(pathname + 'get-home');
  logger.info("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    logger.info("req.session:", req.session);
    if (req.query.down == undefined) {
      userDao.queryTInformation(req.session.user, res);
    } else if (req.query.down == "stuInfo") {
      logger.info("下载学生信息表：", req.query.down);
      userDao.downTstudentInfo(req.session.user, res, req);
    } else if (req.query.down == "groupInfo") {
      logger.info("下载商户集团信息表：", req.query.down);
      userDao.downTgroupInfo(req.session.user, res, req);
    } else if (req.query.down == "orderInfo") {
      logger.info("下载订单信息表：", req.query.down);
      userDao.downTorderInfo(req.session.user, res, req);
    } else if (req.query.down == "stockInfo") {
      logger.info("下载供货表：", req.query.down);
      userDao.downTstockInfo(req.session.user, res, req);
    } else if (req.query.down == "clearInfo") {
      logger.info("下载清算表：", req.query.down);
      userDao.downTclearInfo(req.session.user, res, req);
    } else if (req.query.down == "coursePlans") {
      logger.info("下载教材计划表：", req.query.down);
      userDao.downTcoursePlans(req.session.user, res, req);
    } else if (req.query.down == "corpInfo") {
      logger.info("下载供应商信息表：", req.query.down);
      userDao.downTcorpInfo(req.session.user, res, req);
    } else if (req.query.down == "subOrderInfo") {
      logger.info("下载子订单信息表：", req.query.down);
      userDao.downTsubOrderInfo(req.session.user, res, req);
    } else if (req.query.down == "subStockInfo") {
      logger.info("下载子供货表：", req.query.down);
      userDao.downTsubStockInfo(req.session.user, res, req);
    } else if (req.query.down == "productList") {
      logger.info("下载商品清单表：", req.query.down);
      userDao.downTproductList(req.session.user, res, req);
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