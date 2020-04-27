// 供货管理页 TstockListAdmin 路由
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
  logger.info(pathname + 'get-TstockListAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.deleteStockRecord == undefined) {
      userDao.queryTstockList(req.session.user,res,req);
    }else{
      logger.info("删除采购记录：", req.query.deleteStockRecord);
      userDao.deleteStockRecord(res, req);
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
    if (req.query.querySiftStocks == "true") {
      logger.info('进入TcorpInfoAdmin?querySiftStocks=true，get FormData Params: ', req.body);
      /*筛选采购记录*/
      userDao.querySiftStocks(res,req);
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