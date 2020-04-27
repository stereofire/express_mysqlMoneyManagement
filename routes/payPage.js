// 页 payPage 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
// var $ = require('../jq/jquery');
// var $ = require('jQuery');
const http = require("http");
// var querystring = require('querystring');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    logger.info(method);
    var pathname = url.parse(req.url, true).pathname;
    logger.info(pathname + 'get-payPage');
    logger.info("已登录用户查询：", req.session.islogin);
    if (req.session.islogin) {
        /*获取session.islogin*/
        logger.info("已登录用户查询：", req.session.user);
        var studentName = req.query.studentName;
        var tradeID = req.query.tradeID;
        var sum = req.query.sum;
        var transactionID = req.query.transactionID;
        ejs.renderFile('./views/payPage.ejs', {
            studentName,
            tradeID,
            sum,
            transactionID
        }, function (err, data) {
            if (err) {
                logger.info(err);
            }
            res.end(data);
        })
        // res.send("ajax Test");
    } else {
        ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
            if (err) {
                logger.info(err);
            }
            res.end(data);
        })
    }
});
// router.post('/', function (req, res, next) {
//     var method = req.method.toLowerCase();
//     logger.info(method);
//     var pathname = url.parse(req.url, true).pathname;
//     logger.info(pathname + 'post-payPage');
//     logger.info("ajax Test已登录用户查询：", req.session.islogin);
//     var studentName = req.session.user;
//     if (req.session.islogin) {
//         /*获取session.islogin*/
//     } else {
//         ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
//             if (err) {
//                 logger.info(err);
//             }
//             res.end(data);
//         })
//     }
// });
module.exports = router;