var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');

var userDao = require('../dao/userDao');

// var fs = require('fs');
// var formidable = require('formidable');

// var multipart = require('connect-multiparty');
// var multipartMiddleware = multipart();

/* 加载登录页. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'gethhhhhhhh');
  // if (pathname == '/' && method == 'get') {
  /*显示登录页面*/
  ejs.renderFile('./views/index.ejs', {}, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.end(data);
  })
  // }
});
/* 获取用户登录信息. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'posthhhhhhhh');
  // if (pathname == '/' && method == 'post') {
  /*获取登录信息*/
  console.log('get FormData Params: ', req.body);
  var college = req.body.schools;
  var account = req.body.account;
  var password = req.body.password;
  console.log(college, account, password);
  /*验证登录信息*/
  // var status = userDao.check_login(account, password, res);
  // var status = userDao.check_login(account, password);
  userDao.check_login(account, password, res);//function (json) {
  
});
module.exports = router;