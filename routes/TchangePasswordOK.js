// 教师密码修改成功页 TchangePasswordOK 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TchangePasswordOK');

  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    ejs.renderFile('./views/TchangePasswordOK.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }

});
module.exports = router;