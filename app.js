// app.js
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var app = express();
// var $ = jQuery = require("./jq/jquery");
var ejsExcel=require("ejsExcel");


//引入express-session
var session = require("express-session");
//配置中间件
app.use(session({
  secret: 'this is string key', // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
  name: 'session_id',
  /*保存在本地cookie的一个名字 默认connect.sid  可以不设置*/
  cookie: {
    // maxAge:1000 * 60 * 5  
    maxAge: 1000 * 60 * 30 /*过期时间,单位ms，1000*60*30即为30分钟*/
  },
  /*secure https这样的情况才可以访问cookie*/
  resave: false,
  /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/
  saveUninitialized: true, //强制将未初始化的 session 存储。  默认值是true  建议设置成true
  rolling: true //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
}))


// view 引擎设置
// app.set('view engine', 'jade');//jade渲染
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// // ejs母版设置
// app.engine('ejs', require('ejs-mate'));
// app.locals._layoutFile = 'layout.ejs';
// var partials = require('express-partials');
// app.use(partials());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //静态资源目录
app.use(bodyParser.json()); //数据JSON类型(载入body-parser中间件才可以使用req.body解析body)
app.use(bodyParser.urlencoded({
  extended: true
})); //解析post请求主体

//路由
const users = require('./routes/users');// 测试
const index = require('./routes/index'); // 登录页 index 路由
const home = require('./routes/home'); //首页 home 路由
const changePassword = require('./routes/changePassword'); // 密码修改页 changePassword 路由
const changePasswordOK = require('./routes/changePasswordOK'); // 密码修改成功页 changePasswordOK 路由
const optionalOrder = require('./routes/optionalOrder'); // 选缴订单页 optionalOrder 路由
const orderConfirm = require('./routes/orderConfirm'); // 订单确认页 orderConfirm 路由
const orderRecord = require('./routes/orderRecord'); // 订单记录页 orderRecord 路由
const paymentConfirmation = require('./routes/paymentConfirmation'); // 支付确认页 paymentConfirmation 路由
const paymentMethod = require('./routes/paymentMethod'); // 支付方式页 paymentMethod 路由
const paymentOrder = require('./routes/paymentOrder'); // 缴费订单页 paymentOrder 路由
const paymentResult = require('./routes/paymentResult'); // 支付结果页 paymentResult 路由
const requiredOrder = require('./routes/requiredOrder'); // 必缴订单页 requiredOrder 路由
const loginOut = require('./routes/loginOut'); // 注销登录 loginOut 路由
const orderSubmit = require('./routes/orderSubmit'); // 订单提交结果 orderSubmit 路由
const scholarshipRecord = require('./routes/scholarshipRecord'); // 奖学金发放信息 scholarshipRecord 路由

const Tindex = require('./routes/Tindex'); // 教师登录 Tindex 路由
const Thome = require('./routes/Thome'); // 教师首页 Thome 路由
const TchangePassword = require('./routes/TchangePassword'); // 密码修改页 changePassword 路由
const TchangePasswordOK = require('./routes/TchangePasswordOK'); // 密码修改成功页 changePasswordOK 路由
const TstudentInfoAdmin = require('./routes/TstudentInfoAdmin'); // 学生信息管理页 TstudentInfoAdmin 路由
const TgroupInfoAdmin = require('./routes/TgroupInfoAdmin'); // 商户集团管理页 TgroupInfoAdmin 路由
const TcorpInfoAdmin = require('./routes/TcorpInfoAdmin'); // 供应商管理页 TcorpInfoAdmin 路由
const TproductListAdmin = require('./routes/TproductListAdmin'); // 缴费项目管理页 TproductListAdmin 路由
const TallOrdersAdmin = require('./routes/TallOrdersAdmin'); // 缴费订单管理页 TallOrdersAdmin 路由
const TpaymentRecordsAdmin = require('./routes/TpaymentRecordsAdmin'); // 缴费记录管理页 TpaymentRecordsAdmin 路由
const TstockListAdmin = require('./routes/TstockListAdmin'); // 供货管理页 TstockListAdmin 路由
const TcoursePlansAdmin = require('./routes/TcoursePlansAdmin'); // 教材计划管理页 TcoursePlansAdmin 路由
const TclearInfoAdmin = require('./routes/TclearInfoAdmin'); // 清算统计页 TclearInfoAdmin 路由
const TscholarshipInfoAdmin = require('./routes/TscholarshipInfoAdmin'); //资金发放管理页 TscholarshipInfoAdmin 路由
const TloginOut = require('./routes/TloginOut'); // 教师用户注销  TloginOut 路由


app.use('/users', users);
app.use('/', index);
app.use('/home', home);
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
app.use('/loginOut', loginOut);
app.use('/orderSubmit', orderSubmit);
app.use('/scholarshipRecord', scholarshipRecord);

app.use('/teacher', Tindex);
app.use('/Thome', Thome);
app.use('/TchangePassword', TchangePassword);
app.use('/TchangePasswordOK', TchangePasswordOK);
app.use('/TstudentInfoAdmin', TstudentInfoAdmin);
app.use('/TgroupInfoAdmin', TgroupInfoAdmin);
app.use('/TcorpInfoAdmin', TcorpInfoAdmin);
app.use('/TproductListAdmin', TproductListAdmin);
app.use('/TallOrdersAdmin', TallOrdersAdmin);
app.use('/TpaymentRecordsAdmin', TpaymentRecordsAdmin);
app.use('/TstockListAdmin', TstockListAdmin);
app.use('/TcoursePlansAdmin', TcoursePlansAdmin);
app.use('/TclearInfoAdmin', TclearInfoAdmin);
app.use('/TscholarshipInfoAdmin', TscholarshipInfoAdmin);
app.use('/TloginOut', TloginOut);

// 捕获路由404并转发到错误处理程序 
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 错误处理程序
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  ejs.renderFile('views/error.ejs', {}, function (err, data) {
    res.end(data);
  })
});

module.exports = app;