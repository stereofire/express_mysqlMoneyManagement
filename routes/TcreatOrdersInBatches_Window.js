// 批量创建必缴订单——设置窗口期 TcreatOrdersInBatches_Window 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
// router.get('/', function (req, res, next) {
//   var method = req.method.toLowerCase();
//   console.log(method);
//   var pathname = url.parse(req.url, true).pathname;
//   console.log(pathname + 'get-TcreatOrdersInBatches_Window');
//   console.log("登录状态：", req.session.islogin);
//   if (req.session.islogin) {
//     console.log("已登录用户查询：", req.session.user);
//     // userDao.queryTcreatOrdersInBatches_Window(res, req);
//   } else {
//     ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
//       if (err) {
//         console.log(err);
//       }
//       res.end(data);
//     })
//   }
// });

/* 获取教师提交的商品编号数量、学生学号. */
router.post('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'post-TcreatOrdersInBatches_Window');
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.islogin);
    if (req.query.setWindow == "true") {
      /*获取商品信息、学号信息信息*/
      console.log('进入TcreatOrdersInBatches_Window?setWindow=true，get FormData Params: ');
      userDao.TcreatOrdersInBatches_Window(res, req);
    } else {
      /*提交批量必缴订单到数据库*/
      console.log('进入TcreatOrdersInBatches_Window，get FormData Params: ', req.body.submitData);
      userDao.TcreatOrdersInBatches_CreatOrders(res, req);
      // res.send(req.body.submitData);
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