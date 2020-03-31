// 教师登录 Tindex 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-Tindex');
  ejs.renderFile('./views/Tindex.ejs', {}, function (err, data) {
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
  console.log(pathname + 'post-Tindex');
  /*获取登录信息*/
  console.log('get FormData Params: ', req.body);
  var college = req.body.schools;
  var account = req.body.account;
  var password = req.body.password;
  console.log(college, account, password);
  /*验证登录信息*/
  userDao.teacher_check_login(account, password, req, res);//function (json) {
});
module.exports = router;