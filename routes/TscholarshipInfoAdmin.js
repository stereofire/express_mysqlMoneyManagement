// 资金发放管理页 TscholarshipInfoAdmin 路由
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
}).single('scholarshipInfoUpLoad'); //注意路径最前面的点，表示根目录

router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  console.log(method);
  var pathname = url.parse(req.url, true).pathname;
  console.log(pathname + 'get-TscholarshipInfoAdmin');
  console.log("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    console.log("已登录用户查询：", req.session.user);
    if (req.query.deleteScholarship != undefined) {
      console.log("删除资金发放：", req.query.deleteScholarship);
      userDao.deleteScholarship(res, req);
    } else if (req.query.down == "excelTemplate") {
      console.log("下载资金发放表模板：", req.query.down);
      res.download("public/excelTemplates4downLoad/scholarshipInfoTemplate4Excel.xlsx");
    } else {
      userDao.queryTscholarshipInfo(req.session.user, res, req);
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
      console.log("进入TscholarshipInfoAdmin?fileUpload=true");
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

              var TscholarshipUploadParams = [];
              var scholarshipInfo = xlsx.parse('./public/uploadExcels/' + req.file.originalname)[0].data;
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
              for (var i = 1; i < scholarshipInfo.length; i++) {
                var stuID = scholarshipInfo[i][0];
                var scholarshipType = scholarshipInfo[i][1];
                var scholarshipName = scholarshipInfo[i][2];
                var scholarshipGread = scholarshipInfo[i][3];
                var scholarshipAmount = scholarshipInfo[i][4];
                var scholarshipChannel = scholarshipInfo[i][5];
                var scholarshipID = [];
                // 插入数据
                pool.getConnection(function (err, connection) {
                  if (err) { //数据库连接池错误
                    return console.error(error);
                  }
                  // 查询最后一个奖学金id
                  connection.query($sql.TscholarshipInfoUpload_queryLastScholarshipID, function (err, result) {
                    if (err) {
                      connection.release();
                      console.log(err);
                      return console.error(error);
                    } else {
                      console.log('查询最后一个奖学金id成功');
                      for (var j = 1; j < scholarshipInfo.length; j++) {
                        var lastScholarshipID = result[0].发放编号;
                        var num = lastScholarshipID.substring(1);
                        for (var m = 0; m < j; m++) {
                          num++;
                        }
                        if (String(num).length < 10) {
                          num = (Array(10).join(0) + num).slice(-10)
                        }
                        var newProductID = "F" + num;
                        scholarshipID[j - 1] = newProductID;
                        console.log("j - 1:", j - 1, lastScholarshipID, num, scholarshipID[j - 1]);

                        console.log((new Date()).getTime()); // js13位时间戳
                        console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); // mysql的datetime时间类型
                        var creatTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                        TscholarshipUploadParams[k] = [scholarshipID[k], stuID, scholarshipType, scholarshipName, scholarshipGread, scholarshipAmount, creatTime, scholarshipChannel];
                      }
                      console.log("TscholarshipUploadParams:", TscholarshipUploadParams);
                      connection.query($sql.TscholarshipInfoUpload, TscholarshipUploadParams[k++], function (err, result) {
                        if (err) {
                          connection.release();
                          console.log(err);
                          return console.error(error);
                        } else {
                          console.log('资金发放上传成功');
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
        SMessage('资金发放上传成功！', res);
      }
    }
    if (req.query.addScholarship == "true") {
      console.log('进入TcorpInfoAdmin?addScholarship=true，get FormData Params: ', req.body);
      /*插入新增资金发放信息*/
      userDao.addScholarshipInfo(res, req);
    }
    if (req.query.querySiftScholarshipInfo == "true") {
      console.log('进入TcorpInfoAdmin?querySiftScholarshipInfo=true，get FormData Params: ', req.body);
      /*筛选资金发放信息*/
      userDao.querySiftScholarshipInfo(res, req);
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
  var result = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
  res.send(result)
}
module.exports = router;