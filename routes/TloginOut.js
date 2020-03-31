// 教师用户注销  TloginOut 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get("/", function (req, res) { 
    req.session.destroy(function (err) {
        console.log(err);
    })
    console.log("用户注销登录。");
    ejs.renderFile('./views/TloginOutSucc.ejs', {}, function (err, data) {
        if (err) {
            console.log(err);
        }
        res.end(data);
    })
});
module.exports = router;