// 供应商管理页 TcorpInfoAdmin 路由
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
  logger.info(pathname + 'get-TcorpInfoAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.changeCorpOpenStatus != undefined) {
      logger.info("修改商户集团启用状态：", req.query.changeCorpOpenStatus);
      userDao.changeCorpOpenStatus(res, req);
    }else{
      userDao.queryTcorpInfo(req.session.user,res,req);
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
    if (req.query.addCorp == "true") {
      logger.info('进入TcorpInfoAdmin?addCorp=true，get FormData Params: ', req.body);
      /*插入新增商户信息*/
      userDao.addCorpInfo(res,req);
    }
    if (req.query.querySiftCorpInfo == "true") {
      logger.info('进入TcorpInfoAdmin?querySiftCorpInfo=true，get FormData Params: ', req.body);
      /*筛选商户信息*/
      userDao.querySiftCorpInfo(res, req);
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