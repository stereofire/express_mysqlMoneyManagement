# express_mysqlMoneyManagement
nodejs实践的高校学生资金综合管理平台PC端全栈

## 版本信息
node: v12.14.1

mysql: 8.0.19

## 源码执行
安装依赖： ```npm install```

运行：```npm start```

结束批处理进程： ```Ctrl + c + y```
## mysql信息
```
mysql: {
        host: '127.0.0.1',
        user: 'root',
        password: '111111',
        database: 'db20200213', 
        port: 3306
    }
 ```
## 客户端浏览器访问
```127.0.0.1:3001```
## 目录介绍  
#### /.VSCodeCounter: vscode统计 ，截至最后一次提交Total : 160 files, 24993 codes, 1846 comments, 779 blanks, all 27618 lines
#### /bin: 用于应用启动
##### /bin/www: http,https配置文件
#### /certificate: https网站的ssl证书与密钥文件
#### /conf: 数据库配置文件
#### /dao: 与数据库交互的主要后端逻辑
#### /illustration: 说明文件，包括数据库表结构、ssl说明
#### /jq:  jQuery
#### /logs: log4js 服务器日志记录配置文件及日志文件
#### /node_modules: nodejs下，npm install 安装的模块文件（模块依赖）
#### /public: 静态资源目录+临时下载文件存储
##### /public/images：前端图片
##### /public/javascripts：前端js
##### /public/stylesheets：前端样式表
##### /public/tables4downLoad：教师首页表格下载资源
##### /public/tableTemplates4downLoad：教师端下载用于批量上传信息下载的模板资源
##### /public/uploadExcels：教师端批量上传表格的临时转储目录
##### /public/favicon.ico：前端网页标题图标
##### /public/uploadTestCoursePlans.xlsx：批量上传教材计划示例
##### /public/uploadTestProductInfo.xlsx：批量上传缴费项目示例
##### /public/uploadTestScholarshipInfo.xlsx：批量上传奖学金信息示例
##### /public/uploadTestStuInfo.xlsx：批量上传学生信息示例
#### /routes：所有pc端（学生端和教师端）网页路由配置文件，可以认为是controller（控制器）目录
#### /util: 系统配置文件
#### /views: 所有pc端（学生端和教师端）前端ejs模板引擎，可以认为是view(视图)目录



##### app.js: 程序main文件
##### package.json: 依赖记录文件
