// 教师首页 Thome (导航)路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-home');
  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    console.log("req.session:", req.session);
    if (req.query.down == undefined) {
      userDao.queryTInformation(req.session.user, res);
    } else if (req.query.down == "stuInfo") {
      console.log("下载学生信息表：", req.query.down);
      userDao.downTstudentInfo(req.session.user, res, req);
    } else if (req.query.down == "groupInfo") {
      console.log("下载商户集团信息表：", req.query.down);
      userDao.downTgroupInfo(req.session.user, res, req);
    } else if (req.query.down == "orderInfo") {
      console.log("下载订单信息表：", req.query.down);
      userDao.downTorderInfo(req.session.user, res, req);
    } else if (req.query.down == "stockInfo") {
      console.log("下载供货表：", req.query.down);
      userDao.downTstockInfo(req.session.user, res, req);
    } else if (req.query.down == "clearInfo") {
      console.log("下载清算表：", req.query.down);
      userDao.downTclearInfo(req.session.user, res, req);
    } else if (req.query.down == "coursePlans") {
      console.log("下载教材计划表：", req.query.down);
      userDao.downTcoursePlans(req.session.user, res, req);
    } else if (req.query.down == "corpInfo") {
      console.log("下载供应商信息表：", req.query.down);
      userDao.downTcorpInfo(req.session.user, res, req);
    } else if (req.query.down == "subOrderInfo") {
      console.log("下载子订单信息表：", req.query.down);
      userDao.downTsubOrderInfo(req.session.user, res, req);
    } else if (req.query.down == "subStockInfo") {
      console.log("下载子供货表：", req.query.down);
      userDao.downTsubStockInfo(req.session.user, res, req);
    } else if (req.query.down == "productList") {
      console.log("下载商品清单表：", req.query.down);
      userDao.downTproductList(req.session.user, res, req);
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