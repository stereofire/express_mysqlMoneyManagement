// 缴费订单管理页 TallOrdersAdmin 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TallOrdersAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    if (req.query.TdeleteOrder == undefined) {
      userDao.queryTallOrders(req.session.user,res,req);
    }else{
      console.log("删除缴费记录：", req.query.TdeleteOrder);
      userDao.TdeleteOrder(res, req);
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
    if (req.query.querySiftAllOrders == "true") {
      console.log('进入TcorpInfoAdmin?querySiftAllOrders=true，get FormData Params: ', req.body);
      /*筛选缴费订单*/
      userDao.querySiftAllOrders(res,req);
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