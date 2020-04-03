// 教材计划管理页 TcoursePlansAdmin 路由
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
}).single('coursePlansUpLoad'); //注意路径最前面的点，表示根目录

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TcoursePlansAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.deleteCoursePlan != undefined) {
      console.log("删除教材计划：", req.query.deleteCoursePlan);
      userDao.deleteCoursePlan(res, req);
    } else if (req.query.down == "excelTemplate") {
      console.log("下载教材计划表模板：", req.query.down);
      res.download("public/excelTemplates4downLoad/coursePlansTemplate4Excel.xlsx");
    } else {
      userDao.queryTcoursePlans(req.session.user, res, req);
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
    if (req.query.fileUpload == "true") {
      console.log("进入TcoursePlansAdmin?fileUpload=ture");
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

              var TcoursePlansUploadParams = [];
              var coursePlansInfo = xlsx.parse('./public/uploadExcels/' + req.file.originalname)[0].data;
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
              for (var i = 1; i < coursePlansInfo.length; i++) {
                var school = coursePlansInfo[i][0];
                var price = coursePlansInfo[i][1];
                var major = coursePlansInfo[i][2];
                var term = coursePlansInfo[i][3];
                var courseName = coursePlansInfo[i][4];
                var textBookName = coursePlansInfo[i][5];
                var publishingHouse = coursePlansInfo[i][6];
                var textBookID = [];
                // 插入数据
                pool.getConnection(function (err, connection) {
                  if (err) { //数据库连接池错误
                    return console.error(error);
                  }
                  // 查询最后一个商品id
                  connection.query($sql.TcoursePlansUpload_queryLastProductID, function (err, result) {
                    if (err) {
                      connection.release();
                      console.log(err);
                      return console.error(error);
                    } else {
                      console.log('查询最后一个商品id成功');
                      for (var j = 1; j < coursePlansInfo.length; j++) {
                        var lastProductID = result[0].商品编号;
                        var num = lastProductID.substring(1);
                        for (var m = 0; m < j; m++) {
                          num++;
                        }
                        if (String(num).length < 6) {
                          num = (Array(6).join(0) + num).slice(-6)
                        }
                        var newProductID = "S" + num;
                        textBookID[j - 1] = newProductID;
                        console.log("j - 1:",j - 1,lastProductID, num, textBookID[j - 1]);
                        TcoursePlansUploadParams[k] = [textBookID[k], school, price, major, term, courseName, textBookName, publishingHouse, textBookID[k], textBookName, price, 'A00006', 0, major, term, courseName, ''];
                      }
                      console.log("TcoursePlansUploadParams:", TcoursePlansUploadParams);
                        connection.query($sql.TcoursePlansUpload, TcoursePlansUploadParams[k++], function (err, result) {
                          if (err) {
                            connection.release();
                            console.log(err);
                            return console.error(error);
                          } else {
                            console.log('教材计划上传成功');
                            connection.release();
                            console.log(JSON.stringify(response));
                            console.log('\n----------SUCCEED----------\n\n');
                          }
                        })
                    }
                  })
                });
              }
            }
          });
        });
        SMessage('教材计划上传成功！', res);
      }
    }
    if (req.query.addCoursePlan == "true") {
      console.log('进入TcorpInfoAdmin?addCoursePlan=true，get FormData Params: ', req.body);
      /*插入新增教材计划信息*/
      userDao.addCoursePlanInfo(res, req);
    }
    if (req.query.querySiftCoursePlans == "true") {
      console.log('进入TcorpInfoAdmin?querySiftCoursePlans=true，get FormData Params: ', req.body);
      /*筛选教材计划信息*/
      userDao.querySiftCoursePlans(res, req);
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
// 成功提示，并加载新界面
function SMessage(message, res) {
  // res.setHeader('Content-Type', 'text/html');
  // var result=`<script>alert('${message}'); location.replace(location.href)</script>`;
  var result = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
  res.send(result)
}
module.exports = router;