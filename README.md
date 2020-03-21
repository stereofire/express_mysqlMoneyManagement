# express_mysqlMoneyManagement
nodejs实践的高校学生资金综合管理平台学生端

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
#### /bin: 用于应用启动
#### /public: 静态资源目录
#### /routes：可以认为是controller（控制器）目录
#### /views: ejs模板目录，可以认为是view(视图)目录

#### /util: 工具方法
#### /conf: 配置
#### /dao: 与数据库交互
#### /node_modules:  依赖
#### /jq:  jQuery,但目前从未使用过。。
##### app.js: 程序main文件
##### package.json: 依赖记录文件
