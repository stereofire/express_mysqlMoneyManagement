var log4js = require('log4js');
// Log4js config下面有三个重要属性：
// appenders：记录器对象，自定义不同的记录器(log输出位置)。
// categories：log 类型，自定义log不同输出方式。
// level：log输出等级，大于某等级的log才会输出。
log4js.configure({
    appenders: {
        console: {
            type: 'console',
        }, //记录器1:输出到控制台 
        data_file: { //记录器2：输出到日期文件
            type: "dateFile",
            filename: __dirname + '/log/timeLogFile',
            pattern: "_yyyy-MM-dd.log", //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep: 30, //时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//default false.是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
            encoding: 'utf-8', //default "utf-8"，文件的编码
        },
        log_file: { //记录器3：输出到文件
            type: 'file',
            filename: __dirname + '/log/logFile', //文件目录，当目录文件或文件夹不存在时，会自动创建
            maxLogSize: 20971520, //文件最大存储空间（byte），当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
            backups: 3, //default value = 5.当文件内容超过文件存储空间时，备份文件的数量
            //compress : true,//default false.是否以压缩的形式保存新文件,默认false。如果true，则新增的日志文件会保存在gz的压缩文件内，并且生成后将不被替换，false会被替换掉
            encoding: 'utf-8', //default "utf-8"，文件的编码
            pattern: "_yyyy-MM-dd.log", //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中,如果为true，则每个文件都会按pattern命名，否则最新的文件不会按照pattern命名
        },
        error_file: { //：记录器4：输出到error log
            type: "dateFile",
            filename: __dirname + '/log/logFile_error', //您要写入日志文件的路径
            alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
            daysToKeep: 30, //时间文件 保存多少天，距离当前天daysToKeep以前的log将被删除
            //compress : true,//（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            pattern: "_yyyy-MM-dd.log", //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding: 'utf-8', //default "utf-8"，文件的编码
            // compress: true, //是否压缩
        }
    },
    replaceConsole: true, //替换console.log  
    categories: {
        default: {
            appenders: ['data_file', 'console', 'log_file'],
            level: 'info'
        }, //默认log类型，输出到控制台 log文件 log日期文件 且登记大于info即可
        production: {
            appenders: ['data_file'],
            level: 'warn'
        }, //生产环境 log类型 只输出到按日期命名的文件，且只输出警告以上的log
        console: {
            appenders: ['console'],
            level: 'debug'
        }, //开发环境  输出到控制台
        debug: {
            appenders: ['console', 'log_file'],
            level: 'debug'
        }, //调试环境 输出到log文件和控制台    
        error_log: {
            appenders: ['error_file'],
            level: 'error'
        } //error 等级log 单独输出到error文件中 任何环境的errorlog 将都以日期文件单独记录
    },
});

// exports.logger = fileLog;
// exports.use = function (app) {
//     //页面请求日志
//     app.use(log4js.connectLogger(fileLog));
// }
module.exports = log4js.getLogger();
module.exports.error = log4js.getLogger('error_log'); //error单独输出到一个文件中

// Log4js log级别
// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF

// 1 该config定义了 三个记录器console(输出到控制台)，  log_file(输出到文件)， data_file(输出到日期文件)
// 2 该config定义了4中log输出类型default，production， console， debug
// default类型，配置了三种记录器，将会输出到data_file(日期log文件),console(控制台),log_file(log文件)，且只会输出大于等于info的log。
// production类型，配置了一种记录器，只会输出到data_file(日期log文件),且只会输出大于等于warn级别的log。
// console类型，配置了一种记录器，只会输出到console(控制台)，且只会输出大于等于debug级别的log。
// debug类型,配置了两种记录器，输出到console(控制台)和 'log_file(log文件)，且只会输出大于等于debug级别的log。
// 示例：

var fileLog = log4js.getLogger('debug'); //获取当前log4js配置 无参数为默认
fileLog.debug("Server started"); //使用

// var logger = log4js.getLogger();
// logger.info("hello world categories-default test, this is info");
// logger.debug("hello world categories-default test, this is debug");
// logger.warn("hello world categories-default test, this is warn");
// logger.error("hello world categories-default test, this is error");

// console.log("sssss");

// logger = log4js.getLogger('production');
// logger.info("hello world categories-production test, this is info");
// logger.debug("hello world categories-production test, this is debug");
// logger.warn("hello world categories-production test, this is warn");
// logger.error("hello world categories-production test, this is error");

// logger = log4js.getLogger('console'); //引用的categories 类型中的console  即输出到console控制台 输出日志级别info(大于info输出)
// logger.info("hello world categories-console test");

// logger = log4js.getLogger('debug');
// logger.info("hello world categories-debug test, this is info");
// logger.debug("hello world categories-debug test, this is debug");