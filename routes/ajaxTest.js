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
router.get('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    console.log(method);
    var pathname = url.parse(req.url, true).pathname;
    console.log(pathname + 'get-ajaxTest');
    console.log("ajax Test已登录用户查询：", req.session.islogin);
    if (req.session.islogin) {
        /*获取session.islogin*/
        console.log("ajax Test已登录用户查询：", req.session.user);
        res.send("ajax Test");
    } else {
        ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
            if (err) {
                console.log(err);
            }
            res.end(data);
        })
    }
});
router.post('/', function (req, res, next) {
    var method = req.method.toLowerCase();
    console.log(method);
    var pathname = url.parse(req.url, true).pathname;
    console.log(pathname + 'post-ajaxTest');
    console.log("ajax Test已登录用户查询：", req.session.islogin);
    var studentName = req.session.username;
    if (req.session.islogin) {
        /*获取session.islogin*/
        console.log("ajax Test已登录用户查询：", req.session.user);
        console.log(req.body.tradeID, req.body.sum);
        // $.post("http://114.115.222.89:20056/PaySim", {
        //     "method": "发起交易",
        //     "target": "测试用户1", //转账对象
        //     "source": "测试用户1", //转账人
        //     "tradeID": tradeID,
        //     "sum": sum,
        //     "timeLimit": 120 //分钟
        // }, function (err, data) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     console.log("sas");
        //     console.log(data);
        //     // res.end(data);
        // })
        console.log("aaa");
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
        console.log("post_data:", post_data);
        var content = JSON.stringify(post_data);
        console.log("content:", content);
        var options = {
            hostname: '114.115.222.89',
            port: 20056,
            path: '/PaySim',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        };
        console.log("options:", options);
        var reqest = http.request(options, function (response) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log('BODY: ' + chunk); 
                var chunkObj = JSON.parse(chunk); 
                var transactionID = chunkObj.transactionID;
                console.log("chunkObj.transactionID:",transactionID);
                var sendData = {
                    studentName: studentName,
                    tradeID: tradeID,
                    sum: sum,
                    transactionID: transactionID
                };
                res.send(sendData);
                // ejs.renderFile('./views/payPage.ejs', {studentName,tradeID,sum,transactionID}, function (err, data) {
                //     if (err) {
                //         console.log(err);
                //     }
                //     res.end(data);
                // })
            });
        });
        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        }); // write data to request body  
        reqest.write(content);
        reqest.end();

        // res.send("ajax Test");
        // res.end();

    } else {
        ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
            if (err) {
                console.log(err);
            }
            res.end(data);
        })
    }
});
module.exports = router;