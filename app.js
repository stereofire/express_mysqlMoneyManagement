// app.js
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs=require('ejs');
var engine = require('ejs-mate');

const index = require('./routes/index');
const users = require('./routes/users');
const changePassword = require('./routes/changePassword');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');//jade渲染
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


//路由
app.use('/', index);
app.use('/users', users);
app.use('/changePassword', changePassword);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
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
