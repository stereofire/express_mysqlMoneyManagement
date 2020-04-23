// 批量创建必缴订单——学号确认 TcreatOrdersInBatches_Sconfirm 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TcreatOrdersInBatches_Sconfirm');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    console.log("req.query.ProIDs:", req.query.ProIDs); //输出req.query:[ 'goods0', 'goods1' ]
    console.log("req.query.stuIDs:", req.query.stuIDs); //输出
    var ProIDs = req.query.ProIDs;
    var stuIDs = req.query.stuIDs;
    var teacherName = req.session.username;
    ejs.renderFile('./views/TcreatOrdersInBatches_Sconfirm.ejs', {
      stuIDs,
      teacherName
    }, function (err, data) {
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

// /* 获取教师提交的学生信息. */
// router.post('/', function (req, res, next) {
//   var method = req.method.toLowerCase();
//   console.log(method);
//   var pathname = url.parse(req.url, true).pathname;
//   console.log(pathname + 'post-orderConfirm');
//   console.log("已登录用户查询：", req.session.islogin);
//   if (req.session.islogin) {
//     /*获取学生信息*/
//     console.log('get orders FormData Params: ', req.body);
//     var submitData = req.body.submitData;
//     var ordersObj = JSON.parse(submitData);
//     console.log("get submitDataObj:", ordersObj);
//     /*加载选择窗口期页面*/
//     var account = req.session.user;
//     // userDao.querySubmitOrder(account, ordersObj, res, req); 
    
//   } else {
//     ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
//       if (err) {
//         console.log(err);
//         res.send("登录超时刷新失败");
//       }
//       res.end(data);
//     })
//   }
// });
module.exports = router;