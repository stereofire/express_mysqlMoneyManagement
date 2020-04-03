// 缴费记录管理页 TpaymentRecordsAdmin 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TpaymentRecordsAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    if (req.query.deleteOrderRecord == undefined) {
      userDao.queryTpaymentRecords(req.session.user,res,req);
    }else{
      console.log("删除缴费记录：", req.query.deleteOrderRecord);
      userDao.deleteOrderRecord(res, req);
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
    if (req.query.querySiftPaymentRecords == "true") {
      console.log('进入TcorpInfoAdmin?querySiftPaymentRecords=true，get FormData Params: ', req.body);
      /*筛选缴费记录*/
      userDao.querySiftPaymentRecords(res,req);
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