// 批量创建必缴订单——选择学号 TcreatOrdersInBatches_CStu 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TcreatOrdersInBatches_CStu');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    userDao.queryTcreatOrdersInBatches_CStu(res, req);
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
});

/* 获取教师提交的学生学号. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'post-TcreatOrdersInBatches_CStu');
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.islogin);
    if (req.query.queryStuInfo == "true") {
      console.log('进入TcreatOrdersInBatches_CStu?queryStuInfo=true，get FormData Params: ', req.body.submitData);
      userDao.queryTcreatOrdersInBatches_CStu(res, req);
    } else if (req.query.querySiftStuInfo_CStu == "true") {
      console.log('进入TcreatOrdersInBatches_CStu?querySiftStuInfo_CStu=true，get FormData Params: ', req.body.submitData);
      userDao.querySiftStuInfo_CStu(res, req);
    } else {
      /*获取学号信息*/
      console.log('get orders FormData Params: ', req.body);
      var submitData = req.body.submitData;
      var ordersObj = JSON.parse(submitData);
      console.log("get submitDataObj:", ordersObj);
      /*提交商品信息、学号信息到数据库*/
      var account = req.session.user;
      userDao.querySubmitOrder(account, ordersObj, res, req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
        res.send("登录超时刷新失败");
      }
      res.end(data);
    })
  }
});
module.exports = router;