// 批量创建必缴订单——学号确认 TcreatOrdersInBatches_Sconfirm 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'get-TcreatOrdersInBatches_Sconfirm');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    logger.info("req.query.ProIDs:", req.query.ProIDs); //输出req.query:[ 'goods0', 'goods1' ]
    logger.info("req.query.stuIDs:", req.query.stuIDs); //输出
    var ProIDs = req.query.ProIDs;
    var stuIDs = req.query.stuIDs;
    var teacherName = req.session.username;
    ejs.renderFile('./views/TcreatOrdersInBatches_Sconfirm.ejs', {
      stuIDs,
      teacherName
    }, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});

// /* 获取教师提交的学生信息. */
// router.post('/', function (req, res, next) {
//   var method = req.method.toLowerCase();
//   logger.info(method);
//   var pathname = url.parse(req.url, true).pathname;
//   logger.info(pathname + 'post-orderConfirm');
//   logger.info("已登录用户查询：", req.session.islogin);
//   if (req.session.islogin) {
//     /*获取学生信息*/
//     logger.info('get orders FormData Params: ', req.body);
//     var submitData = req.body.submitData;
//     var ordersObj = JSON.parse(submitData);
//     logger.info("get submitDataObj:", ordersObj);
//     /*加载选择窗口期页面*/
//     var account = req.session.user;
//     // userDao.querySubmitOrder(account, ordersObj, res, req); 
    
//   } else {
//     ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
//       if (err) {
//         logger.info(err);
//         res.send("登录超时刷新失败");
//       }
//       res.end(data);
//     })
//   }
// });
module.exports = router;