// 订单记录页 orderRecord 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    console.log(method);
    var pathname = url.parse(req.url, true).pathname;
    console.log(pathname + 'get-orderRecord');

    console.log("已登录用户查询：", req.session.islogin);
    if(req.session.islogin){  /*获取session.islogin*/
      console.log("已登录用户查询：", req.session.user);
      userDao.queryOrderRecord(req.session.user,res);
    }else{
      res.send('账户未登录');
    }
  });
module.exports = router;