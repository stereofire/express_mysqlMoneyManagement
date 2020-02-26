// app.js
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs=require('ejs');
var engine = require('ejs-mate');

var app = express();

// view 引擎设置
// app.set('view engine', 'jade');//jade渲染
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 

// ejs母版设置
// app.engine('ejs', engine);
// app.locals._layoutFile = 'layout.ejs';

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //静态资源目录
app.use(bodyParser.json());//数据JSON类型(载入body-parser中间件才可以使用req.body解析body)
app.use(bodyParser.urlencoded({ extended: true }));//解析post请求主体

//路由（home.ejs 无需路由）
const index = require('./routes/index');// 登录页 index 路由
const users = require('./routes/users');
const changePassword = require('./routes/changePassword');// 密码修改页 changePassword 路由
const changePasswordOK = require('./routes/changePasswordOK');// 密码修改成功页 changePasswordOK 路由
const optionalOrder = require('./routes/optionalOrder');// 选缴订单页 optionalOrder 路由
const orderConfirm = require('./routes/orderConfirm');// 订单确认页 orderConfirm 路由
const orderRecord = require('./routes/orderRecord');// 订单记录页 orderRecord 路由
const paymentConfirmation = require('./routes/paymentConfirmation');// 支付确认页 paymentConfirmation 路由
const paymentMethod = require('./routes/paymentMethod');// 支付方式页 paymentMethod 路由
const paymentOrder = require('./routes/paymentOrder');// 缴费订单页 paymentOrder 路由
const paymentResult = require('./routes/paymentResult');// 支付结果页 paymentResult 路由
const requiredOrder = require('./routes/requiredOrder');// 必缴订单页 requiredOrder 路由

app.use('/', index);
app.use('/users', users);
app.use('/changePassword', changePassword);
app.use('/changePasswordOK', changePasswordOK);
app.use('/optionalOrder', optionalOrder);
app.use('/orderConfirm', orderConfirm);
app.use('/orderRecord', orderRecord);
app.use('/paymentConfirmation', paymentConfirmation);
app.use('/paymentMethod', paymentMethod);
app.use('/paymentOrder', paymentOrder);
app.use('/paymentResult', paymentResult);
app.use('/requiredOrder', requiredOrder);

// 捕获路由404并转发到错误处理程序 
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误处理程序
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  ejs.renderFile('views/error.ejs',{},function(err,data){
    res.end(data);})
});

module.exports = app;
