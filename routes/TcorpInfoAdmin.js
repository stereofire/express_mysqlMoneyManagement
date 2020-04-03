// 供应商管理页 TcorpInfoAdmin 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TcorpInfoAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.changeCorpOpenStatus != undefined) {
      console.log("修改商户集团启用状态：", req.query.changeCorpOpenStatus);
      userDao.changeCorpOpenStatus(res, req);
    }else{
      userDao.queryTcorpInfo(req.session.user,res,req);
    } 
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
});
router.post('/', function (req, res, next) {
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.addCorp == "true") {
      console.log('进入TcorpInfoAdmin?addCorp=true，get FormData Params: ', req.body);
      /*插入新增商户信息*/
      userDao.addCorpInfo(res,req);
    }
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