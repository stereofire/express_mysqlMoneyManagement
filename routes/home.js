// 首页 home (导航)路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-home');

  // var account = req.query.account;//通过url解析的目前用户信息时用的，采用session后替代了
  // console.log("get account:" + account);

  console.log("已登录用户查询：", req.session.islogin);
  if (req.session.islogin) {
    /*获取session.islogin*/
    console.log("已登录用户查询：", req.session.user);
    console.log("req.session:",req.session);
    userDao.queryInformation(req.session.user, res);
  } else {
    ejs.renderFile('./views/loginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        console.log(err);
      }
      res.end(data);
    })
  }
  // 使用async和await尝试——返回user对象有问题，还不如在userDao.queryInformation直接渲染了
  // var user = {};
  // function getInformation(){
  //   return new Promise(resolve=>{
  //     user = userDao.queryInformation(account);
  //     console.log(user);
  //     console.log(1);
  //     resolve();
  //   })
  // }
  // async function openWeb(){
  //   await getInformation();
  //   console.log(2);
  //   if(!(user=={})){
  //       ejs.renderFile('./views/home.ejs', {user}, function (err, data) {
  //         if (err) {
  //           console.log(err);
  //         }
  //         res.end(data);
  //       })
  //     }else{
  //       res.send("hehe");
  //     }
  // }
  // openWeb();

  // 使用有返回值的函数尝试——因为异步特性，失效
  // var user = userDao.queryInformation(account);
  // console.log(user);
  // if(!(user=={})){
  //   ejs.renderFile('./views/home.ejs', {user}, function (err, data) {
  //     if (err) {
  //       console.log(err);
  //     }
  //     res.end(data);
  //   })
  // }else{
  //   res.send("hehe");
  // }
  // res.send("hehe");
});
module.exports = router;

// url参数解析demo:

// var express = require('express');
// var app = express();
// app.get('/csdn', function (req, res) {
//   var name = req.query.name;
//   res.send(name)
// });
// app.get('/csdn/:id', function (req, res) {
//   var id = req.params.id;
//   res.send(id)
// });
// app.listen(3000, '0.0.0.0');

// 第一个get方法则是可以获取像这样的参数：
// 127.0.0.1:3000/csdn?name=参数
// 第二个get则是可以获取到比较优雅的路由地址参数：
// 127.0.0.1:3000/csdn/参数


// 使用async和await异步变同步demo：132
// function fn(){
//   return new Promise(resolve=>{
//       console.log(1)
//       resolve()
//   })
// }
// async function f1(){
//   await fn()
//   console.log(2)
// }
// f1()
// console.log(3)