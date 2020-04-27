// 登录页 index 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
/* 加载登录页. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'gethhhhhhhh');
  // if (pathname == '/' && method == 'get') {
  /*显示登录页面*/
  ejs.renderFile('./views/index.ejs', {}, function (err, data) {
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
  logger.info(pathname + 'posthhhhhhhh');
  // if (pathname == '/' && method == 'post') {
  /*获取登录信息*/
  logger.info('get FormData Params: ', req.body);
  var college = req.body.schools;
  var account = req.body.account;
  var password = req.body.password;
  logger.info(college, account, password);
  /*验证登录信息*/
  // var status = userDao.check_login(account, password, res);
  // var status = userDao.check_login(account, password);
  userDao.check_login(account, password, req, res);//function (json) {
});
module.exports = router;