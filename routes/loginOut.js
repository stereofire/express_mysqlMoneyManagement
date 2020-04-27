// 用户注销 loginOut 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get("/", function (req, res) { //退出登录，session销毁
    //req.session.cookie.maxAge=0;  /*改变cookie的过期时间*/
    //销毁
    req.session.destroy(function (err) {
        logger.info(err);
    })
    logger.info("用户注销登录。");
    ejs.renderFile('./views/loginOutSucc.ejs', {}, function (err, data) {
        if (err) {
            logger.info(err);
        }
        res.end(data);
    })
});
module.exports = router;