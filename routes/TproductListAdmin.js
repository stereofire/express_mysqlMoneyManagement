// 缴费项目管理页 TproductListAdmin 路由
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
}).single('productListUpLoad'); //注意路径最前面的点，表示根目录
var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
router.get('/', function (req, res, next) {
  var method = req.method.toLowerCase();
  logger.info(method);
  var pathname = url.parse(req.url, true).pathname;
  logger.info(pathname + 'get-TproductListAdmin');
  logger.info("登录状态：", req.session.islogin);
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.changeProductOpenStatus != undefined) {
      logger.info("修改商品上架状态：", req.query.changeProductOpenStatus);
      userDao.changeProductOpenStatus(res, req);
    } else if (req.query.down == "excelTemplate") {
      logger.info("下载缴费项目信息表模板：", req.query.down);
      res.download("public/excelTemplates4downLoad/productListTemplate4Excel.xlsx");
    } else {
      userDao.queryTproductList(req.session.user,res,req);
    } 
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});
router.post('/', upload, function (req, res, next) {
  if (req.session.islogin) {
    logger.info("已登录用户查询：", req.session.user);
    if (req.query.fileUpload == "true") {
      logger.info("进入TproductListAdmin?fileUpload=true");
      if (req.file.length == 0) { //判断一下文件是否存在，前端代码中也已进行判断。
        res.render("error", {
          message: "上传文件不能为空！"
        });
        return
      } else {
        // 文件信息
        if (req.file) {
          logger.info("----------接收文件----------\n");
          logger.info(req.file);
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
              logger.info('\n----------SAVING-----------\n');

              var TproductUploadParams = [];
              var productInfo = xlsx.parse('./public/uploadExcels/' + req.file.originalname)[0].data;
              // 删除缓存文件
              fs.unlinkSync(req.file.path, function (err) {
                if (err) {
                  return console.error(error);
                } else {
                  logger.info("删除缓存文件:", req.file.path);
                }
              })
              fs.unlinkSync('./public/uploadExcels/' + req.file.originalname, function (err) {
                if (err) {
                  return console.error(error);
                } else {
                  logger.info("删除缓存文件:", './public/uploadExcels/' + req.file.originalname);
                }
              })
              var k = 0;
              for (var i = 1; i < productInfo.length; i++) {
                productId = productInfo[i][0];
                productName = productInfo[i][1];
                productPrice = productInfo[i][2];
                productCorpID = productInfo[i][3];
                productStatus = productInfo[i][4];
                productAttri1st = productInfo[i][5];
                productAttri2nd = productInfo[i][6];
                productAttri3rd = productInfo[i][7];
                productRemark = productInfo[i][8];
                TproductUploadParams[i - 1] = [productId, productName, productPrice, productCorpID, productStatus, productAttri1st, productAttri2nd, productAttri3rd,productRemark];
                logger.info("TproductUploadParams[i-1]:", i - 1, TproductUploadParams[i - 1]);
                // 插入数据
                pool.getConnection(function (err, connection) {
                  if (err) { //数据库连接池错误
                    return console.error(error);
                  }
                  connection.query($sql.TproductUpload, TproductUploadParams[k++], function (err, result) {
                    // logger.info("TproductUploadParams[k]:",k,TproductUploadParams[k]);
                    if (err) {
                      connection.release();
                      logger.info(err);
                      return console.error(error);
                      // return SMessage("商品数据上传失败", res);
                    } else {
                      logger.info('商品数据上传成功');
                      connection.release();
                      logger.info(JSON.stringify(response));
                      // logger.info(result);
                      logger.info('\n----------SUCCEED----------\n\n');
                      // res.json(response);
                    }
                  })
                });
              }
            }
          });
        });
        SMessage('商品数据上传成功！', res);
      }
    }
    if (req.query.addProduct == "true") {
      logger.info('进入TcorpInfoAdmin?addProduct=true，get FormData Params: ', req.body);
      /*插入新增商品信息*/
      userDao.addProductInfo(res,req);
    }
    if (req.query.querySiftProductListInfo == "true") {
      logger.info('进入TcorpInfoAdmin?querySiftProductListInfo=true，get FormData Params: ', req.body);
      /*筛选商品信息*/
      userDao.querySiftProductListInfo(res, req);
    }
  } else {
    ejs.renderFile('./views/TloginTimeOut.ejs', {}, function (err, data) {
      if (err) {
        logger.info(err);
      }
      res.end(data);
    })
  }
});

// 成功提示，并加载新界面
function SMessage(message, res) {
  // res.setHeader('Content-Type', 'text/html');
  // var result=`<script>alert('${message}'); location.replace(location.href)</script>`;
  var result = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
  res.send(result)
}
module.exports = router;