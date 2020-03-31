// 学生信息管理页 TstudentInfoAdmin 路由
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var url = require('url');
var userDao = require('../dao/userDao');
var fs = require('fs');
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('../dao/userSqlMapping');
var pool = mysql.createPool($util.extend({}, $conf.mysql));
var multer = require('multer');
const xlsx = require('node-xlsx');
var $ = require('../jq/jquery');
var upload = multer({
  dest: './public/uploadExcels/'
}).single('stuInfoUpLoad'); //注意路径最前面的点，表示根目录

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TstudentInfoAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.changeReadStatus != undefined) {
      console.log("修改学生在读状态：", req.query.changeReadStatus);
      userDao.changeReadStatus(res, req);
    } else if (req.query.down == "excelTemplate") {
      console.log("下载学生信息表模板：", req.query.down);
      res.download("public/excelTemplates4downLoad/stuInfoTemplate4Excel.xlsx");
    } else {
      userDao.queryTstudentInfo(req.session.user, res, req);
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
router.post('/', upload, function (req, res, next) {
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.fileUpload == "ture") {
      console.log("进入TstudentInfoAdmin?fileUpload=ture");
      if (req.file.length == 0) { //判断一下文件是否存在，前端代码中也已进行判断。
        res.render("error", {
          message: "上传文件不能为空！"
        });
        return
      } else {
        // 文件信息
        if (req.file) {
          console.log("----------接收文件----------\n");
          console.log(req.file);
        }
        var des_file = './public/uploadExcels/' + req.file.originalname;
        fs.readFile(req.file.path, function (error, data) {
          if (error) {
            return console.error(error);
          }
          fs.writeFile(des_file, data, function (err) {
            if (err) { // 接收失败
              return console.error(error);
            } else { // 接收成功
              var response = {
                message: 'File uploaded successfully!',
                filename: req.file.originalname
              };
              console.log('\n----------SAVING-----------\n');

              var TstuUploadParams = [];
              var userInfo = xlsx.parse('./public/uploadExcels/' + req.file.originalname)[0].data;
              // 删除缓存文件
              fs.unlinkSync(req.file.path, function (err) {
                if (err) {
                  return console.error(error);
                } else {
                  console.log("删除缓存文件:", req.file.path);
                }
              })
              fs.unlinkSync('./public/uploadExcels/' + req.file.originalname, function (err) {
                if (err) {
                  return console.error(error);
                } else {
                  console.log("删除缓存文件:", './public/uploadExcels/' + req.file.originalname);
                }
              })
              var k = 0;
              for (var i = 1; i < userInfo.length; i++) {
                studentId = userInfo[i][0];
                collage = userInfo[i][1];
                studentName = userInfo[i][2];
                department = userInfo[i][3];
                major = userInfo[i][4];
                gender = userInfo[i][5];
                grade = userInfo[i][6];
                status = userInfo[i][7];
                TstuUploadParams[i - 1] = [studentId, collage, studentName, department, major, gender, grade, status];
                console.log("TstuUploadParams[i-1]:", i - 1, TstuUploadParams[i - 1]);
                // 插入数据
                pool.getConnection(function (err, connection) {
                  if (err) { //数据库连接池错误
                    return console.error(error);
                  }
                  connection.query($sql.TstuUpload, TstuUploadParams[k++], function (err, result) {
                    // console.log("TstuUploadParams[k]:",k,TstuUploadParams[k]);
                    if (err) {
                      connection.release();
                      console.log(err);
                      return console.error(error);
                      // return SMessage("学生数据上传失败", res);
                    } else {
                      console.log('学生数据上传成功');
                      connection.release();
                      console.log(JSON.stringify(response));
                      // console.log(result);
                      console.log('\n----------SUCCEED----------\n\n');
                      // res.json(response);
                    }
                  })
                });
              }
            }
          });
        });
        SMessage('学生数据上传成功！', res);
      }
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

// 失败提示，不加载新界面
function showMessage(message, res) {
  var result = `<script>alert('${message}');history.back()</script>`;
  res.send(result)
}
// 成功提示，并加载新界面
function SMessage(message, res) {
  // res.setHeader('Content-Type', 'text/html');
  // var result=`<script>alert('${message}'); location.replace(location.href)</script>`;
  var result = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
  res.send(result)
}
module.exports = router;