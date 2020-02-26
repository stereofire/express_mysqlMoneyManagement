var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
/* 进入密码修改页. */
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-changePassword');
  ejs.renderFile('./views/changePassword.ejs', {}, function (err, data) {
    if (err) {
      console.log(err);
    }
    res.end(data);
  })
});
// 提交密码修改表单
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'post-changePassword');
  /*获取密码修改表单信息*/
  console.log('get FormData Params: ', req.body);
  var account = req.body.account;
  var old_password = req.body.old_password;
  var new_password = req.body.new_password;
  console.log(account, old_password, new_password);
  /*更新密码信息*/
  userDao.change_Password(account, old_password, new_password, res);
  // res.send("xxx");
});
module.exports = router;