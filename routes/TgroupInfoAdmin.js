// 商户集团管理页 TgroupInfoAdmin 路由
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
  logger.info(pathname + 'get-TgroupInfoAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.changeGroupOpenStatus != undefined) {
      logger.info("修改商户集团启用状态：", req.query.changeGroupOpenStatus);
      userDao.changeGroupOpenStatus(res, req);
    }else{
      userDao.queryTgroupInfo(req.session.user, res, req);
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
router.post('/',function (req, res, next) {
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.addGroup == "true") {
      logger.info('进入TgroupdentInfoAdmin?addGroup=true，get FormData Params: ', req.body);
      var group_name = req.body.group_name;
      var group_remark = req.body.group_remark;
      var open_status = req.body.open_status;
      logger.info(group_name, group_remark, open_status);
      /*插入新增商户集团信息*/
      userDao.addGroupInfo(res,req);
    }
    if (req.query.querySiftGroupInfo == "true") {
      logger.info('进入TcorpInfoAdmin?querySiftGroupInfo=true，get FormData Params: ', req.body);
      /*筛选商户集团信息*/
      userDao.querySiftGroupInfo(res, req);
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