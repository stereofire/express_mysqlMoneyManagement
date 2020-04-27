// 教师登录 Tindex 路由
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
  logger.info(pathname + 'get-Tindex');
  ejs.renderFile('./views/Tindex.ejs', {}, function (err, data) {
    if (err) {
      logger.info(err);
    }
    res.end(data);
  })
  // }
});
/* 获取用户登录信息. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'post-Tindex');
  /*获取登录信息*/
  logger.info('get FormData Params: ', req.body);
  var college = req.body.schools;
  var account = req.body.account;
  var password = req.body.password;
  // var ip = req.body.ip;
  logger.info("教师登录表单参数：",college, account, password);
  /*验证登录信息*/
  userDao.teacher_check_login(account, password, req, res); //function (json) {
});
module.exports = router;