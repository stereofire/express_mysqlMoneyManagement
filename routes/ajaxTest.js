// 页 ajaxTest 路由
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
    logger.info(pathname + 'get-ajaxTest');
    logger.info("ajax Test已登录用户查询：", req.session.islogin);
    if (req.session.islogin) {
        /*获取session.islogin*/
        logger.info("ajax Test已登录用户查询：", req.session.user);
        res.send("ajax Test");
    } else {
        ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
            if (err) {
                logger.info(err);
            }
            res.end(data);
        })
    }
});
router.post('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    logger.info(method);
    var pathname = url.parse(req.url, true).pathname;
    logger.info(pathname + 'post-ajaxTest');
    logger.info("ajax Test已登录用户查询：", req.session.islogin);
    var studentName = req.session.username;
    if (req.session.islogin) {
        /*获取session.islogin*/
        logger.info("ajax Test已登录用户查询：", req.session.user);
        logger.info(req.body.tradeID, req.body.sum);
        // $.post("http://114.115.222.89:20056/PaySim", {
        //     "method": "发起交易",
        //     "target": "测试用户1", //转账对象
        //     "source": "测试用户1", //转账人
        //     "tradeID": tradeID,
        //     "sum": sum,
        //     "timeLimit": 120 //分钟
        // }, function (err, data) {
        //     if (err) {
        //         logger.info(err);
        //     }
        //     logger.info("sas");
        //     logger.info(data);
        //     // res.end(data);
        // })
        logger.info("aaa");
        var tradeID = req.body.tradeID;
        var sum = req.body.sum;
        var post_data = {
            method:"发起交易",
            target:"测试用户1",
            source: "测试用户1",
            tradeID: tradeID,
            sum: sum,
            timeLimit: 120
        }    
        logger.info("post_data:", post_data);
        var content = JSON.stringify(post_data);
        logger.info("content:", content);
        var options = {
            hostname: '114.115.222.89',
            port: 20056,
            path: '/PaySim',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        };
        logger.info("options:", options);
        var reqest = http.request(options, function (response) {
            logger.info('STATUS: ' + response.statusCode);
            logger.info('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                logger.info('BODY: ' + chunk); 
                var chunkObj = JSON.parse(chunk); 
                var transactionID = chunkObj.transactionID;
                logger.info("chunkObj.transactionID:",transactionID);
                var sendData = {
                    studentName: studentName,
                    tradeID: tradeID,
                    sum: sum,
                    transactionID: transactionID
                };
                res.send(sendData);
                // ejs.renderFile('./views/payPage.ejs', {studentName,tradeID,sum,transactionID}, function (err, data) {
                //     if (err) {
                //         logger.info(err);
                //     }
                //     res.end(data);
                // })
            });
        });
        req.on('error', function (e) {
            logger.info('problem with request: ' + e.message);
        }); // write data to request body  
        reqest.write(content);
        reqest.end();

        // res.send("ajax Test");
        // res.end();

    } else {
        ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
            if (err) {
                logger.info(err);
            }
            res.end(data);
        })
    }
});
module.exports = router;