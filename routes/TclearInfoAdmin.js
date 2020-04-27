// 清算统计页 TclearInfoAdmin 路由
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
  logger.info(pathname + 'get-TclearInfoAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.deleteClearInfo == undefined) {
      userDao.queryTclearInfo(req.session.user,res,req);
    }else{
      logger.info("删除清算记录：", req.query.deleteClearInfo);
      userDao.deleteTclearInfo(res, req);
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
    if (req.query.querySiftClearInfo == "true") {
      logger.info('TclearInfoAdmin?querySiftClearInfo=true，get FormData Params: ', req.body);
      /*筛选清算记录*/
      userDao.querySiftClearInfo(res,req);
    }else if (req.query.updateClearInfo == "true") {
      logger.info('TclearInfoAdmin?updateClearInfo=true，get FormData Params: ', req.body);
      /*筛选清算记录*/
      userDao.updateClearInfo(res,req);
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