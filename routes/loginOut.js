// 用户注销 loginOut 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get("/", function (req, res) { //退出登录，session销毁
    //req.session.cookie.maxAge=0;  /*改变cookie的过期时间*/
    //销毁
    req.session.destroy(function (err) {
        console.log(err);
    })
    console.log("用户注销登录。");
    res.send('退出登录成功');
});
module.exports = router;