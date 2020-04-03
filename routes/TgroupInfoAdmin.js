// 商户集团管理页 TgroupInfoAdmin 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TgroupInfoAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.changeGroupOpenStatus != undefined) {
      console.log("修改商户集团启用状态：", req.query.changeGroupOpenStatus);
      userDao.changeGroupOpenStatus(res, req);
    }else{
      userDao.queryTgroupInfo(req.session.user, res, req);
    } 
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
});
router.post('/',function (req, res, next) {
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.addGroup == "true") {
      console.log('进入TgroupdentInfoAdmin?addGroup=true，get FormData Params: ', req.body);
      var group_name = req.body.group_name;
      var group_remark = req.body.group_remark;
      var open_status = req.body.open_status;
      console.log(group_name, group_remark, open_status);
      /*插入新增商户集团信息*/
      userDao.addGroupInfo(res,req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
});
module.exports = router;