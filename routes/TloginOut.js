// 教师用户注销  TloginOut 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get("/", function (req, res) { 
    req.session.destroy(function (err) {
        logger.info(err);
    })
    logger.info("用户注销登录。");
    ejs.renderFile('./views/TloginOutSucc.ejs', {}, function (err, data) {
        if (err) {
            logger.info(err);
        }
        res.end(data);
    })
});
module.exports = router;