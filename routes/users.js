var express = require('express');
var router = express.Router();
 
var userDao = require('../dao/userDao');
 var ejs=require('ejs');
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('LSX respond with a resource');
});

 
// 增加用户
//TODO 同时支持get,post
router.get('/addUser', function(req, res, next) {
userDao.add(req, res, next);
});
 
router.get('/queryAll', function(req, res, next) {
userDao.queryAll(req, res, next);
});
 
router.get('/query', function(req, res, next) {
userDao.queryById(req, res, next);
});
 
router.get('/deleteUser', function(req, res, next) {
userDao.delete(req, res, next);
});
 
router.post('/updateUser', function(req, res, next) {
userDao.update(req, res, next);
});
 
module.exports = router;
