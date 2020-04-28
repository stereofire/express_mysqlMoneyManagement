// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
var ejs = require('ejs');
var fs = require('fs');
moment = require('moment');
var ejsExcel = require("ejsexcel");
// var exceltt = require("./exceltt.js");
const path = require('path');
const xlsx = require('node-xlsx');
// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));
var multer = require('multer');
var $ = require('../jq/jQuery');
var upload = multer({
    dest: './public/uploadExcels/'
}).single('stuInfoUpLoad');
// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

var log4js = require('log4js');
var log = require("../logs/log");
var logger = log4js.getLogger();
const obj = {
    // check_login: function (account, password, callback) {
    // 登录验证
    check_login: function (account, password, req, res) {
        // logger.info(account, password);
        pool.getConnection(function (err, connection) {
            // logger.info(account, password);
            if (err) { //数据库连接池错误
                // callback(0);
                logger.info("数据库连接池错误，错误编号：00001");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00001，返回学生登录页";
                var re = `<script>alert('${message}'); location.href="/"</script>`;
                res.send(re);
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误
                    logger.info("用户账户查询错误，请重新登录，错误编号：00002");
                    var message = "抱歉，发生了错误，请联系管理员。错误编号：00002，返回学生登录页";
                    var re = `<script>alert('${message}'); location.href="/"</script>`;
                    res.send(re);
                    // callback(1);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    logger.info("用户不存在，请重新登录");
                    var message = "用户不存在，请重新登录";
                    var re = `<script>alert('${message}'); location.href="/"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var college = new String(result[0].学校);
                    var studentName = new String(result[0].姓名);
                    var school = new String(result[0].院系);
                    var major = new String(result[0].专业);
                    var gender = new String(result[0].性别);
                    var grade = new String(result[0].年级);
                    var readStatus = new String(result[0].在读状态);
                    var rightPassword = new String(result[0].密码);
                    if (readStatus == '1') {
                        readStatus = "在读";
                    } else {
                        readStatus = "不在读";
                    }
                    logger.info("在读状态：",readStatus);
                    logger.info("正确密码应为：", rightPassword);
                    if (rightPassword == password) { //密码正确
                        logger.info('密码正确,登录成功');
                        // 将登录的用户保存到session中
                        req.session.user = account;
                        // 设置是否登录为true
                        req.session.islogin = true;
                        // 设置已登录用户的欢迎名
                        req.session.username = studentName;
                        // 开启event_scheduler
                        connection.query($sql.setEventScheduler, function (err, result) {
                            if (err) { //开启event_scheduler错误
                                logger.info("开启event_scheduler错误。错误编号：00003");
                                var message = "抱歉，发生了错误，请联系管理员。错误编号：00003，返回学生登录页";
                                var re = `<script>alert('${message}'); location.href="/"</script>`;
                                res.send(re);
                            }
                        });
                        ejs.renderFile('views/home.ejs', {
                            user: {
                                arr: {
                                    // homeHref: "/home?account=" + account,//通过url解析的目前用户信息时用的，采用session后替代了
                                    studentName: studentName,
                                    gender: gender,
                                    grade: grade,
                                    studentID: account,
                                    major: major,
                                    school: school,
                                    college: college,
                                    readStatus: readStatus
                                }
                            }
                        }, function (err, data) {
                            if (err) {
                                logger.info("刷新首页错误。错误编号：00004");
                                var message = "抱歉，发生了错误，请联系管理员。错误编号：00004，返回学生登录页";
                                var re = `<script>alert('${message}'); location.href="/"</script>`;
                                res.send(re);
                            }
                            res.end(data);
                        })
                        // callback(2);
                        connection.release();
                    } else { //密码错误
                        logger.info("密码错误，请重新登陆！");
                        var message = "密码错误，请重新登陆！";
                        var re = `<script>alert('${message}'); location.href="/"</script>`;
                        res.send(re);
                        // ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        //     if (err) {
                        //         logger.info("刷新登录页错误。错误编号：00005");
                        //         var message = "抱歉，发生了错误，请联系管理员。错误编号：00005，返回学生登录页";
                        //         var re = `<script>alert('${message}'); location.href="/"</script>`;
                        //         res.send(re);
                        //     }
                        //     res.end(data);
                        // })
                        // callback(3);
                        connection.release();
                    }
                }
            });
        });
    },

    // 密码修改操作
    updatePassword: function (account, new_password, res) {
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00006");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00006，返回学生首页";
                var re = `<script>alert('${message}'); location.href="/home"</script>`;
                res.send(re);
            }
            connection.query($sql.changePssword, [new_password, account], function (err, result) {
                if (err) {
                    logger.info("密码修改出错，请重新密码更新操作。错误编号：00007");
                    var message = "抱歉，密码修改出错，请重新密码更新操作。错误编号：00007，返回学生首页";
                    var re = `<script>alert('${message}'); location.href="/home"</script>`;
                    res.send(re);
                    ejs.renderFile('views/changePassword.ejs', {}, function (err, data) {
                        if (err) {
                            logger.info("密码修改出错后，刷新学生首页错误。错误编号：00008");
                            var message = "抱歉，刷新学生首页错误，请联系管理员。错误编号：00008，返回学生首页";
                            var re = `<script>alert('${message}'); location.href="/home"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //密码修改成功,重新登录
                    // logger.info(result[0]);//密码修改成功后不会有反馈，result=undefined
                    logger.info("密码修改成功,请重新登录");
                    connection.release();
                    ejs.renderFile('views/changePasswordOK.ejs', {}, function (err, data) {
                        if (err) {
                            logger.info("密码修改成功,刷新登录页出错。错误编号：00009");
                            var message = "抱歉，刷新登录页出错，请重新刷新登录。错误编号：00009，返回登录页";
                            var re = `<script>alert('${message}'); location.href="/"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                }
            });
        });
    },
    // 密码修改验证，引用updatePassword
    change_Password: function (account, old_password, new_password, res) {
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00010");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00010，返回密码修改页";
                var re = `<script>alert('${message}'); location.href="/changePassword"</script>`;
                res.send(re);
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误,重新密码更新
                    logger.info("用户账户查询错误，请重新密码更新操作。错误编号：00011");
                    var message = "抱歉，用户账户查询错误，请重新密码更新操作。错误编号：00011，返回密码修改页";
                    var re = `<script>alert('${message}'); location.href="/changePassword"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在,重新密码更新
                    logger.info("用户不存在，请重新密码更新操作");
                    var message = "用户不存在，请重新密码更新操作。返回密码修改页";
                    var re = `<script>alert('${message}'); location.href="/changePassword"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var rightPassword = new String(result[0].密码);
                    logger.info("正确密码应为：", rightPassword);
                    if (rightPassword == old_password) { //密码正确,可以进行密码修改操作
                        logger.info('密码正确,可以进行密码修改操作');
                        connection.release();
                        obj.updatePassword(account, new_password, res);
                        logger.info('调用了userDao.updatePassword');
                    } else { //密码错误，驳回修改密码请求
                        logger.info("密码错误，驳回修改密码请求！");
                        var message = "抱歉，密码错误，请重新密码更新操作。返回密码修改页";
                        var re = `<script>alert('${message}'); location.href="/changePassword"</script>`;
                        res.send(re);
                        connection.release();
                    }
                }
            });
        });
    },

    // home页信息
    queryInformation: function (account, res) {
        logger.info(account + "进入queryInformation函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00012");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00012，返回登录页";
                var re = `<script>alert('${message}'); location.href="/"</script>`;
                res.send(re);
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误
                    logger.info("用户账户查询错误。错误编号：00013");
                    var message = "抱歉，发生了错误，请联系管理员。错误编号：00013，返回登录页";
                    var re = `<script>alert('${message}'); location.href="/"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    logger.info("用户不存在。错误编号：00014");
                    var message = "抱歉，用户不存在，请重新登录。错误编号：00014，返回登录页";
                    var re = `<script>alert('${message}'); location.href="/"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var college = new String(result[0].学校);
                    var studentName = new String(result[0].姓名);
                    var school = new String(result[0].院系);
                    var major = new String(result[0].专业);
                    var gender = new String(result[0].性别);
                    var grade = new String(result[0].年级);
                    var readStatus = new String(result[0].在读状态);
                    var rightPassword = new String(result[0].密码);
                    if (readStatus == '1') {
                        readStatus = "在读";
                    } else {
                        readStatus = "不在读";
                    }
                    logger.info("在读状态：",readStatus);
                    ejs.renderFile('views/home.ejs', {
                        user: {
                            arr: {
                                // homeHref: "/home?account=" + account,//通过url解析的目前用户信息时用的，采用session后替代了
                                studentName: studentName,
                                gender: gender,
                                grade: grade,
                                studentID: account,
                                major: major,
                                school: school,
                                college: college,
                                readStatus: readStatus
                            }
                        }
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生首页错误。错误编号：00015");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00015，返回登录页";
                            var re = `<script>alert('${message}'); location.href="/"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // paymentOrder缴费订单页信息（仅需订单总额）
    queryTotalAmount: function (account, res, req) {
        logger.info(account + "进入queryTotalAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00016");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00016，返回首页";
                var re = `<script>alert('${message}'); location.href="/home"</script>`;
                res.send(re);
            }
            var arrAccount = [account, account, account];
            connection.query($sql.TotalAmount, arrAccount, function (err, result) {
                if (err) { //用户账户查询错误
                    logger.info("用户账户查询错误。错误编号：00017");
                    var message = "抱歉，用户账户查询错误，请重试。返回首页";
                    var re = `<script>alert('${message}'); location.href="/home"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    logger.info("用户不存在。错误编号：00018");
                    var message = "抱歉，用户不存在，请重新登录。错误编号：00018，返回登录页";
                    var re = `<script>alert('${message}'); location.href="/"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    // var totalAmount = new String(result[0].totalAmount);
                    // var totalAmount = 2000;
                    // logger.info(result);
                    var totalAmount = result;
                    // logger.info(totalAmount[0].totalAmount);
                    // logger.info(totalAmount[1].totalAmount);
                    // logger.info(totalAmount[2].totalAmount);
                    if (totalAmount[0].totalAmount == null) {
                        totalAmount[0].totalAmount = 0;
                        // logger.info(totalAmount[0].totalAmount);
                    }
                    if (totalAmount[1].totalAmount == null) {
                        totalAmount[1].totalAmount = 0;
                        // logger.info(totalAmount[1].totalAmount);
                    }
                    if (totalAmount[2].totalAmount == null) {
                        totalAmount[2].totalAmount = 0;
                        // logger.info(totalAmount[2].totalAmount);
                    }
                    var studentName = req.session.username;
                    ejs.renderFile('views/paymentOrder.ejs', {
                        totalAmount,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费订单页错误。错误编号：00019");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00019，返回首页";
                            var re = `<script>alert('${message}'); location.href="/home"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // requireOrder必缴订单页信息(两个函数)
    queryRequireAmount: function (account, Result, res, req) {
        logger.info(account + "进入queryRequireAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) {
                logger.info("数据库连接池错误。错误编号：00020");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00020，返回缴费订单页";
                var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                res.send(re);
            }
            connection.query($sql.RequireAmount, account, function (err, result) {
                if (err) {
                    logger.info("必缴账单查询错误。错误编号：00021");
                    var message = "抱歉，必缴账单查询错误。错误编号：00021，返回缴费订单页";
                    var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无必缴账单总额,返回必缴账单总额为0、必缴订单
                    logger.info("无必缴账单总额,返回必缴账单总额为0、必缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: 0,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新必缴订单页错误。错误编号：00022");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00022，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                } else { //有必缴账单总额
                    // logger.info(result[0]);
                    var requireAmount = new String(result[0].requireAmount);
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: requireAmount,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新必缴订单页错误。错误编号：00023");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00023，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    queryRequireOrders: function (account, res, req) {
        logger.info(account + "进入queryRequireOrders函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00024");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00024，返回缴费订单页";
                var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                res.send(re);
            }
            connection.query($sql.RequireOrders, account, function (err, result) {
                if (err) { //必缴账单查询错误
                    logger.info("必缴账单查询错误。错误编号：00025");
                    var message = "抱歉，必缴账单查询错误。错误编号：00025，返回缴费订单总页";
                    var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                    res.send(re);
                } else if (result[0] == undefined) { //无必缴账单
                    logger.info("无必缴账单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: 0,
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新必缴订单页错误。错误编号：00026");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00026，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有必缴账单
                    // logger.info(result);
                    obj.queryRequireAmount(account, result, res, req);
                    connection.release();
                }
            });
        });
    },

    //optionalOrder 选缴订单页信息(两个函数)
    queryOptionalAmount: function (account, Result, res, req) {
        logger.info(account + "进入queryOptionalAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) {
                logger.info("数据库连接池错误。错误编号：00027");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00027，返回缴费订单页";
                var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                res.send(re);
            }
            connection.query($sql.OptionalAmount, account, function (err, result) {
                if (err) {
                    logger.info("选缴账单查询错误。错误编号：00028");
                    var message = "抱歉，选缴账单查询错误。错误编号：00028，返回缴费订单页";
                    var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0].optionalAmount == null) { //无选缴账单总额,返回选缴账单总额为0、选缴订单
                    logger.info("无选缴账单总额,返回选缴账单总额为0、选缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        optionalAmount: 0,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新选缴订单页错误。错误编号：00029");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00029，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                } else { //有选缴账单总额
                    // logger.info("选缴账单总额:", result[0].optionalAmount);
                    var optionalAmount = new String(result[0].optionalAmount);
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        optionalAmount: optionalAmount,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新选缴订单页错误。错误编号：00030");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00030，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    queryOptionalOrder: function (account, res, req) {
        logger.info(account + "进入queryOptionalOrder函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00031");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00031，返回缴费订单页";
                var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                res.send(re);
            }
            connection.query($sql.OptionalOrder, account, function (err, result) {
                if (err) { //选缴订单查询错误
                    logger.info("选缴订单查询错误。错误编号：00032");
                    var message = "抱歉，选缴订单查询错误。错误编号：00032，返回缴费订单页";
                    var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无可选缴订单
                    logger.info("无可选缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新选缴订单页错误。错误编号：00033");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00033，返回缴费订单页";
                            var re = `<script>alert('${message}'); location.href="/paymentOrder"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有选缴订单
                    // logger.info(result);
                    obj.queryOptionalAmount(account, result, res, req);
                    connection.release();
                }
            });
        });
    },

    //orderRecord订单记录页信息
    queryOrderRecord: function (account, res, req) {
        logger.info(account + "进入queryOrderRecord函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00034");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00034，返回首页";
                var re = `<script>alert('${message}'); location.href="/home"</script>`;
                res.send(re);
            }
            connection.query($sql.OrderRecord, account, function (err, result) {
                if (err) { //订单记录查询错误
                    logger.info("订单记录查询错误。错误编号：00035");
                    var message = "抱歉，订单记录查询错误。错误编号：00035，返回首页";
                    var re = `<script>alert('${message}'); location.href="/home"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无订单记录
                    logger.info("无订单记录");
                    var studentName = req.session.username;
                    ejs.renderFile('views/orderRecord.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新订单记录页错误。错误编号：00036");
                            var message = "抱歉，订单记录查询错误。错误编号：00036，返回首页";
                            var re = `<script>alert('${message}'); location.href="/home"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有订单记录
                    // logger.info(result);
                    var studentName = req.session.username;
                    ejs.renderFile('views/orderRecord.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新订单记录页错误。错误编号：00037");
                            var message = "抱歉，订单记录查询错误。错误编号：00037，返回首页";
                            var re = `<script>alert('${message}'); location.href="/home"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // paymeMethod缴费方式页面ejs参数设定与渲染
    queryPayMethod: function (account, data, res, req) {
        logger.info(account + "进入queryPayMethod函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00038");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00038，返回订单记录页";
                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                res.send(re);
            }
            var orderNo = data.OrderNo;
            var Text = data.text;
            connection.query($sql.AmountAndResttime, [account, orderNo], function (err, result) {
                if (err) { //订单支付查询错误
                    logger.info("订单支付查询错误。错误编号：00039");
                    var message = "抱歉，订单支付查询错误。错误编号：00039，返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                } else if (result[0] == undefined) { //订单支付不存在
                    var message = "抱歉，订单支付不存在。返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                    connection.release();
                } else { //订单支付存在
                    // logger.info(result);
                    var Data = {
                        Text: Text,
                        OrderNo: orderNo,
                        OrderAccount: result[0].交易单号,
                        OrderAmount: result[0].交易金额,
                        OrderCreatTime: result[0].创建时间,
                        OrderLimitTime: result[0].支付期限,
                        CountDoun: result[0].剩余时间
                    }
                    // logger.info(req.session.username);
                    var studentName = req.session.username;
                    ejs.renderFile('./views/paymentMethod.ejs', {
                        Data,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新支付方式页错误。错误编号：00040");
                            var message = "抱歉，发生了错误，请联系管理员。错误编号：00040，返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // orderSubmit提交订单——插入订单信息表
    querySubmitOrder: function (account, data, res, req) {
        logger.info(account + "进入querySubmitOrder函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00041");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00041，返回订单记录页";
                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                res.send(re);
            }
            logger.info("待插入订单信息：",data); // { S000002: '1', S000001: '1' }
            var studentName = req.session.username;


            // 插入订单信息
            // logger.info((new Date()).getTime()); // js13位时间戳
            // logger.info(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); // mysql的datetime时间类型
            var creattime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var payLimitTime = moment(new Date()).add(2, 'days').format('YYYY-MM-DD HH:mm:ss');;

            var orderid = obj.createRandomId(); // 生成唯一订单号：YYYY-MM-DD+js13位时间戳+7位随机数字
            // res.send(orderid);
            connection.query($sql.InsertOrder, [orderid, creattime, account, payLimitTime], function (err, result) {
                if (err) { //订单信息表插入错误
                    logger.info("订单信息表插入错误。错误编号：00042");
                    var message = "抱歉，订单信息表插入错误。错误编号：00042，返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                    connection.release();
                } else { //订单信息表插入成功
                    // logger.info(result.insertId);
                    var insertOrderId = result.insertId;
                    // 引用查询商品单价和供应商代码的函数
                    // obj.queryCmmodit(account, insertOrderId, data, res, req);

                    // 循环查询所有商品单价和供应商代码，并插入子订单信息表
                    var goodsList = Object.keys(data);
                    logger.info("待插入商品信息：",goodsList);
                    var k = 0;
                    for (var i = 0; i < goodsList.length; i++) {
                        connection.query($sql.QueryCmmodit, goodsList[i], function (err, result) {
                            if (err) { //查询商品单价和供应商代码错误
                                logger.info("查询商品单价和供应商代码错误。错误编号：00043");
                                var message = "抱歉，查询商品单价和供应商代码错误。错误编号：00043，返回订单记录页";
                                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                res.send(re);
                                connection.release();
                            } else {
                                // logger.info(result);
                                var Result = JSON.parse(JSON.stringify(result));
                                // logger.info(Result);
                                var price = Result[0].商品单价;
                                var MerchantID = Result[0].商户代码;
                                // logger.info(price,MerchantID);

                                // 产生子订单编号
                                var childOrderID = "";
                                childOrderID = insertOrderId + obj.PrefixInteger(k + 1, 2);
                                logger.info("产生待插入子订单编号childOrderID:", childOrderID);

                                // 订单编号：insertOrderId
                                // 商品编号：goodsList[i]
                                // 数量：data.goodsList[i]
                                // 单价：price
                                // 子订单总额：data.goodsList[i]*price
                                // 商户代码：MerchantID
                                // logger.info(insertOrderId,goodsList[k],data[goodsList[k]],price,data[goodsList[k++]]*price,MerchantID);

                                var arrChildOrder = [childOrderID, insertOrderId, goodsList[k], parseInt(data[goodsList[k]]), price, data[goodsList[k++]] * price, MerchantID];
                                logger.info("待插入子订单参数：",arrChildOrder);
                                connection.query($sql.InsertChildOrder, arrChildOrder, function (err, result) {
                                    if (err) { //插入子订单错误
                                        logger.info("插入子订单错误。错误编号：00044");
                                        var message = "抱歉，插入子订单错误。错误编号：00044，返回订单记录页";
                                        var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                        res.send(re);
                                        connection.release();
                                    } else { // SUM查询需要插入订单信息表的订单总额
                                        connection.query($sql.SumOrderAmount, insertOrderId, function (err, result) {
                                            if (err) { //SUM查询订单总额错误
                                                logger.info("SUM查询订单总额错误。错误编号：00045");
                                                var message = "抱歉，查询订单总额错误。错误编号：00045，返回订单记录页";
                                                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                                res.send(re);
                                                connection.release();
                                            } else { //SUM查询订单总额成功
                                                // logger.info(insertOrderId, result[0].订单总额);
                                                var amount = result[0].订单总额;
                                                connection.query($sql.UpdateOrderAmount, [amount, insertOrderId], function (err, result) {
                                                    if (err) { //更新订单总额错误
                                                        logger.info("更新订单总额错误。错误编号：00046");
                                                        var message = "抱歉，更新订单总额错误。错误编号：00046，返回订单记录页";
                                                        var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                                        res.send(re);
                                                        connection.release();
                                                    }
                                                });

                                            }

                                        });
                                    }
                                });
                            }
                        });
                    }
                    connection.release();

                    // res.send("插入插入子订单成功");
                    ejs.renderFile('./views/orderSubmit.ejs', {
                        // Data,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新orderSubmit页错误。错误编号：00047");
                            var message = "抱歉，更新订单总额错误。错误编号：00047，返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                }
            });

        });
    },

    // 生成唯一交易单号编码
    createRandomId: function () {
        return moment(new Date()).format('YYYYMMDD') + (new Date()).getTime() + Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 7 - 1));
    },

    // num传入的数字，m需要的字符长度。例如：传入8，需要的字符长度为3，调用方法后字符串结果为：008
    PrefixInteger: function (num, n) {
        return (Array(n).join(0) + num).slice(-n);
    },

    // 支付成功后跳转支付成功结果页
    queryPaySuccRe: function (res, req) {
        var account = req.session.user;
        var studentName = req.session.username;
        var payResult = req.query.payResult;
        var orderNo = req.query.orderNo;
        logger.info(account + "进入queryPaySuccRe函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00048");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00048，返回订单记录页";
                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                res.send(re);
            }
            // logger.info((new Date()).getTime()); // js13位时间戳
            // logger.info(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); // mysql的datetime时间类型
            var payTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            connection.query($sql.setOrderPayTime, [payTime, orderNo, orderNo, orderNo], function (err, result) {
                if (err) { //更新订单支付时间和状态错误
                    logger.info("更新订单支付时间和状态错误。错误编号：00049");
                    var message = "抱歉，发生了错误，请联系管理员。错误编号：00049，返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                } else { //更新订单支付时间和状态成功
                    logger.info("更新订单支付时间成功");
                    connection.query($sql.QueryOrderInfo, orderNo, function (err, result) {
                        if (err) { //订单信息查询错误
                            logger.info("订单信息查询错误。错误编号：00050");
                            var message = "抱歉，订单信息查询错误。错误编号：00050，返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                        } else if (result[0] == undefined) { //无订单信息
                            logger.info("无订单信息，返回订单记录页");
                            var message = "抱歉，无订单信息。返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //有订单信息
                            // logger.info(result);
                            var transID = result[0].交易单号;
                            var sum = result[0].交易金额;
                            connection.release();
                            ejs.renderFile('./views/paymentResult.ejs', {
                                studentName,
                                payResult,
                                orderNo,
                                transID,
                                payTime,
                                sum
                            }, function (err, data) {
                                if (err) {
                                    logger.info("刷新支付结果页错误。错误编号：00051");
                                    var message = "抱歉，刷新支付结果页错误。错误编号：00051，返回订单记录页";
                                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                    res.send(re);
                                }
                                res.end(data);
                            })
                        }
                    });
                }
            });
        });
    },
    // 支付失败后跳转支付失败结果页
    queryPayFailRe: function (res, req) {
        var account = req.session.user;
        var studentName = req.session.username;
        var payResult = req.query.payResult;
        var orderNo = req.query.orderNo;
        logger.info(account + "进入queryPayFailRe函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00052");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00052，返回订单记录页";
                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                res.send(re);
            }
            connection.query($sql.setOrderPayStatus, [orderNo, orderNo, orderNo], function (err, result) {
                if (err) { //更新订单支付时间和状态错误
                    logger.info("更新订单支付时间和状态错误。错误编号：00053");
                    var message = "抱歉，更新订单支付时间和状态错误。错误编号：00053，返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                } else { //更新订单支付时间和状态成功
                    logger.info("更新订单支付时间成功");
                    connection.query($sql.QueryOrderInfo, orderNo, function (err, result) {
                        if (err) { //订单信息查询错误
                            logger.info("订单信息查询错误。错误编号：00054");
                            var message = "抱歉，订单信息查询错误。错误编号：00054，返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                        } else if (result[0] == undefined) { //无订单信息
                            logger.info("无订单信息，返回订单记录页");
                            var message = "抱歉，无订单信息。返回订单记录页";
                            var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //有订单信息
                            // logger.info(result);
                            var transID = result[0].交易单号;
                            var sum = result[0].交易金额;
                            var failReason = result[0].支付失败原因;
                            connection.release();
                            ejs.renderFile('./views/paymentResult.ejs', {
                                studentName,
                                payResult,
                                orderNo,
                                transID,
                                sum,
                                failReason
                            }, function (err, data) {
                                if (err) {
                                    logger.info("刷新支付结果页错误。错误编号：00055");
                                    var message = "抱歉，订单信息查询错误。错误编号：00055，返回订单记录页";
                                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                                    res.send(re);
                                }
                                res.end(data);
                            })
                        }
                    });
                }
            });
        });
    },
    // 奖学金发放信息页
    queryScholarshipRecord: function (account, res, req) {
        logger.info(account + "进入queryScholarshipRecord函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00056");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00056，返回首页";
                var re = `<script>alert('${message}'); location.href="/home"</script>`;
                res.send(re);
            }
            connection.query($sql.QueryScholarship, account, function (err, result) {
                if (err) { //奖学金信息查询错误
                    logger.info("奖学金信息查询错误。错误编号：00057");
                    var message = "抱歉，奖学金信息查询错误。错误编号：00057，返回首页";
                    var re = `<script>alert('${message}'); location.href="/home"</script>`;
                    res.send(re);
                } else if (result[0] == undefined) { //无奖学金信息
                    logger.info("无奖学金信息，返回订单记录页");
                    var message = "抱歉，无奖学金信息。返回首页";
                    var re = `<script>alert('${message}'); location.href="/home"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有奖学金信息
                    // logger.info(result);
                    var scholarshipAmount = 0;
                    for (var i = 0; i < result.length; i++) {
                        scholarshipAmount += result[i].金额;
                    }
                    // obj.queryRequireAmount(account, result, res, req);
                    connection.release();
                    var studentName = req.session.username;
                    // res.send(studentName);
                    ejs.renderFile('./views/scholarshipRecord.ejs', {
                        result,
                        studentName,
                        scholarshipAmount
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新奖学金信息页错误。错误编号：00058");
                            var message = "抱歉，刷新奖学金信息页错误。错误编号：00058，返回首页";
                            var re = `<script>alert('${message}'); location.href="/home"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                }
            });
        });
    },

    //orderRecord订单记录页删除选缴订单
    deleteOrderRecord: function (account, res, req) {
        logger.info(account + "进入deleteOrderRecord函数");
        var orderID = req.query.deleteOrder;
        logger.info("待删除订单编号：",orderID);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00059");
                var message = "抱歉，发生了错误，请联系管理员。错误编号：00059，返回订单记录页";
                var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                res.send(re);
            }
            connection.query($sql.deleteOrder, [orderID, orderID], function (err, result) {
                if (err) { //删除选缴订单错误;
                    logger.info("删除选缴订单错误。错误编号：00060");
                    var message = "抱歉，删除选缴订单错误。错误编号：00060，返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                    connection.release();
                } else { //删除选缴订单成功
                    logger.info("选缴订单删除结果：", result, "加载订单记录页");
                    var message = "删除选缴订单成功。返回订单记录页";
                    var re = `<script>alert('${message}'); location.href="/orderRecord"</script>`;
                    res.send(re);
                    connection.release();
                }
            });
        });
    },

    // 教师登录
    teacher_check_login: function (account, password, req, res) {
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00061");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00061，返回登录页";
                var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                res.send(re);
            }
            // 开启event_scheduler
            connection.query($sql.setEventScheduler, function (err, result) {
                if (err) { //开启event_scheduler错误
                    logger.info("开启event_scheduler错误。错误编号：00003");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00003，返回教师登录页";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                }else{
                    logger.info("开启event_scheduler成功。");
                }
            });
            connection.query($sql.Tcheck, account, function (err, result) {
                if (err) { //用户账户查询错误
                    logger.info("用户账户查询错误。错误编号：00062");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00062，返回登录页";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    logger.info("用户不存在，请重新登录");
                    var message = "抱歉，用户不存在。请重新登录";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var college = new String(result[0].学校);
                    var teacherName = new String(result[0].姓名);
                    var job = new String(result[0].职务);
                    var rightPassword = new String(result[0].密码);
                    logger.info("正确密码应为：", rightPassword);
                    if (rightPassword == password) { //密码正确
                        logger.info('密码正确,登录成功');
                        req.session.user = account;
                        req.session.islogin = true;
                        req.session.username = teacherName;
                        ejs.renderFile('views/Thome.ejs', {
                            user: {
                                arr: {
                                    teacherName: teacherName,
                                    teacherID: account,
                                    college: college,
                                    job: job,
                                }
                            }
                        }, function (err, data) {
                            if (err) {
                                logger.info("用刷新教师登录页错误。错误编号：00063");
                                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00063，返回登录页";
                                var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                                res.send(re);
                            }
                            res.end(data);
                        })
                        connection.release();
                    } else { //密码错误
                        logger.info("密码错误，请重新登陆！");
                        var message = "抱歉，密码错误。请重新登陆";
                        var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                        res.send(re);
                        connection.release();
                    }
                }
            });
        });
    },

    // 教师密码修改操作
    teacher_updatePassword: function (account, new_password, res) {
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00064");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00064，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TchangePssword, [new_password, account], function (err, result) {
                if (err) {
                    logger.info("密码修改出错。错误编号：00065");
                    var message = "抱歉，密码修改出错。错误编号：00065，请重新密码更新操作";
                    var re = `<script>alert('${message}'); location.href="/TchangePassword"</script>`;
                    res.send(re);
                    connection.release();
                } else { //密码修改成功,重新登录
                    // logger.info(result[0]);//密码修改成功后不会有反馈，result=undefined
                    logger.info("密码修改成功,请重新登录");
                    var message = "密码修改成功。请重新登录";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                }
            });
        });
    },
    // 密码修改验证，引用updatePassword
    teacher_change_Password: function (account, old_password, new_password, res) {
        logger.info(account + "进入teacher_change_Password函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00066");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00066，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.Tcheck, account, function (err, result) {
                // logger.info(result);
                if (err) { //用户账户查询错误,重新密码更新
                    logger.info("用户账户查询错误。错误编号：00067");
                    var message = "抱歉，用户账户查询错误。错误编号：00067，请重新密码更新操作";
                    var re = `<script>alert('${message}'); location.href="/TchangePassword"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在,重新密码更新
                    logger.info("用户不存在，请重新密码更新操作");
                    var message = "用户不存在，请重新密码更新操作。";
                    var re = `<script>alert('${message}'); location.href="/TchangePassword"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var rightPassword = new String(result[0].密码);
                    logger.info("正确密码应为：", rightPassword);
                    if (rightPassword == old_password) { //密码正确,可以进行密码修改操作
                        logger.info('密码正确,可以进行密码修改操作');
                        connection.release();
                        obj.teacher_updatePassword(account, new_password, res);
                        logger.info('调用了userDao.teacher_updatePassword');
                    } else { //密码错误，驳回修改密码请求
                        logger.info("密码错误，驳回修改密码请求");
                        var message = "抱歉，密码错误，驳回修改密码请求。请重新密码更新操作";
                        var re = `<script>alert('${message}'); location.href="/TchangePassword"</script>`;
                        res.send(re);
                        connection.release();
                    }
                }
            });
        });
    },

    // Thome页信息 queryTInformation
    queryTInformation: function (account, res) {
        logger.info(account + "进入queryTInformation函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00068");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00068，返回登录页";
                var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                res.send(re);
            }
            connection.query($sql.Tcheck, account, function (err, result) {
                if (err) { //用户账户查询错误
                    logger.info("用户账户查询错误。错误编号：00069");
                    var message = "抱歉，用户账户查询错误。错误编号：00069，返回登录页";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    logger.info("用户不存在，请重新登录");
                    var message = "抱歉，用户不存在，请重新登录";
                    var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                    res.send(re);
                    connection.release();
                } else { //用户存在
                    // logger.info(result[0]);
                    var college = new String(result[0].学校);
                    var teacherName = new String(result[0].姓名);
                    var job = new String(result[0].职务);
                    ejs.renderFile('views/Thome.ejs', {
                        user: {
                            arr: {
                                teacherName: teacherName,
                                teacherID: account,
                                college: college,
                                job: job,
                            }
                        }
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新教师首页错误。错误编号：00070");
                            var message = "抱歉，用户账户查询错误。错误编号：00070，返回登录页";
                            var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();

                }
            });
        });
    },
    // 生成download文件名
    creatfullFileName: function (FileName) {
        var now = new Date();
        var yy = now.getFullYear(); //年
        var mm = now.getMonth() + 1; //月
        var dd = now.getDate(); //日
        var hh = now.getHours(); //时
        var ii = now.getMinutes(); //分
        var ss = now.getSeconds(); //秒
        var clock = yy;
        if (mm < 10) clock += "0";
        clock += mm;
        if (dd < 10) clock += "0";
        clock += dd;
        if (hh < 10) clock += "0";
        clock += hh;
        if (ii < 10) clock += '0';
        clock += ii;
        if (ss < 10) clock += '0';
        clock += ss;
        var fullFileName = FileName + clock + ".xls"; //临时文件名
        return fullFileName;
    },
    // 删除文件夹下所有文件(教师在其首页每点击一次下载文件前，均会触发清除临时后台文件夹下的所有文件)
    deleteFiles: function (folderPath) {

        let forlder_exists = fs.existsSync(folderPath);
        if (forlder_exists) {
            let fileList = fs.readdirSync(folderPath);
            fileList.forEach(function (fileName) {
                fs.unlinkSync(path.join(folderPath, fileName));
            });
        }
    },
    //Thome down = studentInfo 下载学生信息
    downTstudentInfo: function (account, res, req) {
        logger.info(account + "进入downTstudentInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00071");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00071，返回登录页";
                var re = `<script>alert('${message}'); location.href="/teacher"</script>`;
                res.send(re);
            }
            connection.query($sql.TstudentInfo, account, function (err, result) {
                if (err) { //学生信息查询错误
                    logger.info("学生信息查询错误。错误编号：00072");
                    var message = "抱歉，学生信息查询错误。错误编号：00072，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有学生信息
                    // logger.info(result);
                    var FileName = "downLoad_stuInfo"; //表下载时的名称
                    var templateFileName = "template_stuInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = groupInfo 下载商户集团表
    downTgroupInfo: function (account, res, req) {
        logger.info(account + "进入downTgroupInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00073");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00073，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TgroupInfo, account, function (err, result) {
                if (err) { //商户集团信息查询错误
                    logger.info("商户集团信息查询错误。错误编号：00074");
                    var message = "抱歉，商户集团信息查询错误。错误编号：00074，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有商户集团信息
                    var FileName = "downLoad_groupInfo"; //表下载时的名称
                    var templateFileName = "template_groupInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = orderInfo 下载订单信息
    downTorderInfo: function (account, res, req) {
        logger.info(account + "进入ddownTorderInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00075");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00075，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TorderInfo, account, function (err, result) {
                if (err) { //订单信息查询错误
                    logger.info("订单信息查询错误。错误编号：00076");
                    var message = "抱歉，订单信息查询错误。错误编号：00076，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有订单信息
                    var FileName = "downLoad_orderInfo"; //表下载时的名称
                    var templateFileName = "template_orderInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = stockInfo 下载供货表
    downTstockInfo: function (account, res, req) {
        logger.info(account + "进入downTstockInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00077");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00077，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TstockInfo, account, function (err, result) {
                if (err) { //供货表查询错误
                    logger.info("供货表查询错误。错误编号：00078");
                    var message = "抱歉，订单信息查询错误。错误编号：00078，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有供货表
                    var FileName = "downLoad_stockInfo"; //表下载时的名称
                    var templateFileName = "template_stockInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = clearInfo 下载清算表
    downTclearInfo: function (account, res, req) {
        logger.info(account + "进入downTclearInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00079");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00079，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TclearInfo, account, function (err, result) {
                if (err) { //清算表查询错误
                    logger.info("清算表查询错误。错误编号：00080");
                    var message = "抱歉，清算表查询错误。错误编号：00080，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有清算表
                    var FileName = "downLoad_clearInfo"; //表下载时的名称
                    var templateFileName = "template_clearInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = coursePlans 下载教材计划表
    downTcoursePlans: function (account, res, req) {
        logger.info(account + "进入downTcoursePlans函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00081");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00081，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TcoursePlans, account, function (err, result) {
                if (err) { //教材计划表查询错误
                    logger.info("教材计划表查询错误。错误编号：00082");
                    var message = "抱歉，教材计划表查询错误。错误编号：00082，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有教材计划表
                    var FileName = "downLoad_coursePlans"; //表下载时的名称
                    var templateFileName = "template_coursePlans"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = corpInfo 下载供应商信息表
    downTcorpInfo: function (account, res, req) {
        logger.info(account + "进入downTcorpInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00083");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00083，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TcorpInfo, account, function (err, result) {
                if (err) { //供应商信息表查询错误
                    logger.info("供应商信息表查询错误。错误编号：00084");
                    var message = "抱歉，供应商信息表查询错误。错误编号：00084，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else { //有供应商信息表
                    var FileName = "downLoad_corpInfo"; //表下载时的名称
                    var templateFileName = "template_corpInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = subOrderInfo 下载子订单信息表
    downTsubOrderInfo: function (account, res, req) {
        logger.info(account + "进入downTsubOrderInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00085");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00085，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TsubOrderInfo, account, function (err, result) {
                if (err) { //子订单信息表查询错误
                    logger.info("子订单信息表查询错误。错误编号：00086");
                    var message = "抱歉，子订单信息表查询错误。错误编号：00086，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                } else { //有子订单信息表
                    var FileName = "downLoad_subOrderInfo"; //表下载时的名称
                    var templateFileName = "template_subOrderInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = subStockInfo 下载子供货表
    downTsubStockInfo: function (account, res, req) {
        logger.info(account + "进入downTsubStockInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00087");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00087，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TsubStockInfo, account, function (err, result) {
                if (err) { //子供货表查询错误
                    logger.info("子供货表查询错误。错误编号：00088");
                    var message = "抱歉，子供货表查询错误。错误编号：00088，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                } else { //有子供货表
                    var FileName = "downLoad_subStockInfo"; //表下载时的名称
                    var templateFileName = "template_subStockInfo"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },
    //Thome down = productList 下载商品清单表
    downTproductList: function (account, res, req) {
        logger.info(account + "进入downTproductList函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00089");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00089，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TproductList, account, function (err, result) {
                if (err) { //商品清单表查询错误
                    logger.info("商品清单表查询错误。错误编号：00090");
                    var message = "抱歉，商品清单表查询错误。错误编号：00090，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                } else { //有商品清单表
                    var FileName = "downLoad_productList"; //表下载时的名称
                    var templateFileName = "template_productList"; //模板表名称
                    var fullFileName = obj.creatfullFileName(FileName);
                    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
                    ejsExcel.renderExcel(exlBuf, {
                        rsl: result
                    }).then(function (exlBuf2) { //将数据放进模板开始渲染
                        fs.writeFileSync("public/tables4downLoad/" + fullFileName, exlBuf2);
                        res.download("public/tables4downLoad/" + fullFileName);
                    }).catch(function (err) {
                        console.error(err);
                    });
                    connection.release();
                }
            });
        });
    },

    //TstudentInfoAdmin 学生信息管理页信息
    queryTstudentInfo: function (account, res, req) {
        logger.info(account + "进入queryTstudentInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00091");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00091，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TstudentInfo, account, function (err, result) {
                if (err) { //学生信息查询错误
                    logger.info("学生信息查询错误。错误编号：00092");
                    var message = "抱歉，学生信息查询错误。错误编号：00092，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无学生信息
                    logger.info("无学生信息");
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00093");
                            var message = "抱歉，学生信息查询错误。错误编号：00093，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有学生信息
                    // logger.info(result);
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00094");
                            var message = "抱歉，学生信息查询错误。错误编号：00094，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TstudentInfoAdmin 修改学生在读状态
    changeReadStatus: function (res, req) {
        var stuID = req.query.changeReadStatus;
        var teacherName = req.session.username;
        logger.info(teacherName + "进入changeReadStatus函数");
        var setStuStatusArr = [];
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00095");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00095，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TstudentReadStatus, stuID, function (err, result) {
                if (err) { //学生在读状态查询错误
                    logger.info("学生在读状态查询错误。错误编号：00096");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00096，返回学生信息管理页";
                    var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //学生在读状态查询成功
                    if (result[0].在读状态 == 1) {
                        setStuStatusArr = [0, stuID];
                    } else if (result[0].在读状态 == 0) {
                        setStuStatusArr = [1, stuID];
                    }
                    logger.info("学生在读状态:", result, setStuStatusArr);
                    connection.query($sql.TchangeReadStatus, setStuStatusArr, function (err, result) {
                        if (err) { //学生在读状态更改错误
                            logger.info("学生在读状态查询错误。错误编号：00097");
                            var message = "抱歉，学生在读状态更改错误。错误编号：00097，返回学生信息管理页";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //学生在读状态更改成功
                            connection.release();
                            logger.info("学生在读状态更改成功");
                            var message = "学生在读状态更改成功";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TstudentInfoAdmin 新增学生信息
    addStuInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addGroupInfo函数");
        var stu_id = req.body.stu_id;
        var stu_name = req.body.stu_name;
        var stu_school = req.body.stu_school;
        var stu_major = req.body.stu_major;
        var stu_gender = req.body.stu_gender;
        var stu_gread = req.body.stu_gread;
        var stu_readStatus = req.body.stu_readStatus;

        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00098");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00098，返回学生信息管理页";
                var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TaddStuInfo_queryCollege, req.session.user, function (err, result) {
                if (err) { //查询学生（该管理员）所属学校错误
                    logger.info("查询学生（该管理员）所属学校错误。错误编号：00099");
                    var message = "抱歉，查询学生（该管理员）所属学校错误。错误编号：00099，返回学生信息管理页";
                    var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //查询学生（该管理员）所属学校成功
                    logger.info("查询学生（该管理员）所属学校成功");
                    var stu_college = result[0].学校;
                    var addStuInfoArr = [stu_id, stu_college, stu_name, stu_school, stu_major, stu_gender, stu_gread, stu_readStatus];
                    connection.query($sql.TaddStuInfo, addStuInfoArr, function (err, result) {
                        if (err) { //新增学生信息错误
                            logger.info("新增学生信息错误。错误编号：00100",err);
                            var message = "抱歉，新增学生信息错误。错误编号：00100，返回学生信息管理页";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //新增学生信息成功
                            connection.release();
                            logger.info("新增学生信息成功");
                            var message = "新增学生信息成功";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TstudentInfoAdmin 筛选学生信息
    querySiftStuInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftStuInfo函数");
        // logger.info(req.body);
        var stuID = req.body.stuID;
        var stuName = req.body.stuName;
        var stuSchool = req.body.stuSchool;
        var stuMajor = req.body.stuMajor;
        var sex = req.body.sex;
        var grade = req.body.grade;
        var readStatus = req.body.readStatus;
        var sift = [stuID, stuName, stuSchool, stuMajor, sex, grade, readStatus];
        var mark = [1, 1, 1, 1, 1, 1, 1];
        var sql = "select * from 用户信息表";
        var k = 7;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 学号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 姓名 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 院系 = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 专业 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 性别 = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            sql += " 年级 = " + "'" + sift[5] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[6] == 1) {
            if (sift[6] == "在读") {
                sql += " 在读状态 = 1";
            } else if (sift[6] == "不在读") {
                sql += " 在读状态 = 0";
            }
        }
        sql += " ORDER BY 学号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00101");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00101，返回学生信息管理页";
                var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 学生信息查询错误
                    logger.info("学生信息查询错误。错误编号：00102");
                    var message = "抱歉，学生信息查询错误。错误编号：00102，返回学生信息管理页";
                    var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无学生信息
                    logger.info("无学生信息");
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00103");
                            var message = "抱歉，学生信息查询错误。错误编号：00103，返回学生信息管理页";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有学生信息
                    // logger.info(result);
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00104");
                            var message = "抱歉，学生信息查询错误。错误编号：00104，返回学生信息管理页";
                            var re = `<script>alert('${message}'); location.href="/TstudentInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TgroupInfoAdmin 商户集团管理页信息
    queryTgroupInfo: function (account, res, req) {
        logger.info(account + "进入queryTgroupInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00105");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00105，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TgroupInfo, account, function (err, result) {
                if (err) { //商户集团查询错误
                    logger.info("商户集团查询错误。错误编号：00106");
                    var message = "抱歉，商户集团查询错误。错误编号：00106，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无商户集团
                    logger.info("无商户集团");
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商户集团页错误。错误编号：00107");
                            var message = "抱歉，商户集团查询错误。错误编号：00107，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商户集团
                    // logger.info(result);
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商户集团页错误。错误编号：00108");
                            var message = "抱歉，商户集团查询错误。错误编号：00108，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TgroupInfoAdmin 新增商户集团信息
    addGroupInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addGroupInfo函数");
        var group_name = req.body.group_name;
        var group_remark = req.body.group_remark;
        var open_status = req.body.open_status;
        var set_open_status = 0;
        if (open_status == "启用") {
            set_open_status = 1;
        } else {
            set_open_status = 0;
        }
        var addGroupInfoArr = [group_name, group_remark, set_open_status];
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00109");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00109，返回商户集团页";
                var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TaddGroupInfo, addGroupInfoArr, function (err, result) {
                if (err) { //新增商户集团信息错误
                    logger.info("新增商户集团信息错误。错误编号：00110");
                    var message = "抱歉，新增商户集团信息错误。错误编号：00110，返回商户集团页";
                    var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //新增商户集团信息成功
                    connection.release();
                    logger.info("新增商户集团信息成功");
                    var message = "新增商户集团信息成功";
                    var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                    res.send(re);
                }
            });

        });
    },
    // TgroupInfoAdmin 修改商户集团启用状态
    changeGroupOpenStatus: function (res, req) {
        var groupID = req.query.changeGroupOpenStatus;
        var teacherName = req.session.username;
        logger.info(teacherName + "进入changeGroupOpenStatus函数");
        var setGroupStatusArr = [];
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00111");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00111，返回商户集团页";
                var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TgroupOpenStatus, groupID, function (err, result) {
                if (err) { //商户集团启用状态查询错误
                    logger.info("商户集团启用状态查询错误。错误编号：00112");
                    var message = "抱歉，商户集团启用状态查询错误。错误编号：00112，返回商户集团页";
                    var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //商户集团启用状态查询成功
                    if (result[0].状态 == 1) {
                        setGroupStatusArr = [0, groupID];
                    } else if (result[0].状态 == 0) {
                        setGroupStatusArr = [1, groupID];
                    }
                    logger.info("商户集团启用状态:", result, setGroupStatusArr);
                    connection.query($sql.TchangeGroupOpenStatus, setGroupStatusArr, function (err, result) {
                        if (err) { //商户集团启用状态更改错误
                            logger.info("商户集团启用状态更改错误。错误编号：00113");
                            var message = "抱歉，商户集团启用状态更改错误。错误编号：00113，返回商户集团页";
                            var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //商户集团启用状态更改成功
                            connection.release();
                            logger.info("商户集团启用状态更改成功");
                            var message = "商户集团启用状态更改成功";
                            var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TgroupInfoAdmin 筛选商户集团信息
    querySiftGroupInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftGroupInfo函数");
        var groupID = req.body.groupID;
        var groupName = req.body.groupName;
        var groupOpenStatus = req.body.groupOpenStatus;
        var sift = [groupID, groupName, groupOpenStatus];
        var mark = [1, 1, 1];
        var sql = "select * from 商户集团信息表";
        var k = 3;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 集团编号 = " + sift[0];
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 集团名称 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            if (sift[2] == "启用") {
                sql += " 状态 = 1";
            } else if (sift[2] == "禁用") {
                sql += " 状态 = 0";
            }
        }
        sql += " ORDER BY 集团编号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00114");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00114，返回商户集团页";
                var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 商户集团信息查询错误
                    logger.info("商户集团信息查询错误。错误编号：00115");
                    var message = "抱歉，商户集团信息查询错误。错误编号：00115，返回商户集团页";
                    var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无商户集团信息
                    logger.info("无商户集团信息");
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商户集团信息页错误。错误编号：00116");
                            var message = "抱歉，刷新商户集团信息页错误。错误编号：00116，返回商户集团页";
                            var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商户集团信息
                    // logger.info(result);
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商户集团信息页错误。错误编号：00117");
                            var message = "抱歉，刷新商户集团信息页错误。错误编号：00117，返回商户集团页";
                            var re = `<script>alert('${message}'); location.href="/TgroupInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TcorpInfoAdmin 供应商管理页信息
    queryTcorpInfo: function (account, res, req) {
        logger.info(account + "进入queryTcorpInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00118");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00118，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TcorpInfo, function (err, result) {
                if (err) { //供应商查询错误
                    logger.info("供应商查询错误。错误编号：00119");
                    var message = "抱歉，供应商查询错误。错误编号：00119，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无供应商
                    logger.info("无供应商");
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供应商信息页错误。错误编号：00120");
                            var message = "抱歉，刷新供应商信息页错误。错误编号：00120，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有供应商
                    // logger.info(result);
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供应商信息页错误。错误编号：00121");
                            var message = "抱歉，刷新供应商信息页错误。错误编号：00121，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcorpInfoAdmin 新增供应商信息
    addCorpInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addCorpInfo函数");
        var corp_name = req.body.corp_name;
        var corp_bankNo = req.body.corp_bankNo;
        var corp_principal = req.body.corp_principal;
        var corp_prinPhone = req.body.corp_prinPhone;
        var corp_email = req.body.corp_email;
        var corp_prinRemark = req.body.corp_prinRemark;
        var corp_settleType = req.body.corp_settleType;
        var corp_returnGoods = req.body.corp_returnGoods;
        var corp_type = req.body.corp_type;
        var group_ID = req.body.group_ID;
        var corp_address = req.body.corp_address;
        var open_status = req.body.open_status;
        var set_open_status = 1;
        if (open_status == '1') {
            set_open_status = 1;
        } else {
            set_open_status = 0;
        }
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00122");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00122，返回供应商管理页";
                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                res.send(re);
            }
            // 判断新增商户所属集团是否存在，以及该集团的启用状态
            connection.query($sql.TaddCorpInfo_queryGroupID, group_ID, function (err, result) {
                if (err) { //查询新增商户所属集团信息错误
                    logger.info("查询新增商户所属集团信息错误。错误编号：00123");
                    var message = "抱歉，查询新增商户所属集团信息错误。错误编号：00123，返回供应商管理页";
                    var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //查询新增商户所属集团信息成功
                    logger.info("查询新增商户所属集团信息成功");
                    // logger.info(result[0].存在数, result[0].状态);
                    if (result[0].存在数 == 0) {
                        var message = "新增商户所属集团不存在，请重新操作。";
                        var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                        res.send(re);
                    } else {
                        if (result[0].状态 == 0) {
                            set_open_status = 0;
                        }
                        connection.query($sql.TaddCorpInfo_queryLastCorpID, function (err, result) {
                            if (err) { //查询最后一个商户id错误
                                logger.info("查询最后一个商户id错误。错误编号：00124");
                                var message = "抱歉，查询最后一个商户id错误。错误编号：00124，返回供应商管理页";
                                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                res.send(re);
                                connection.release();
                            } else { //查询最后一个商户id成功
                                logger.info("查询最后一个商户id成功");
                                var lastCorpID = result[0].商户代码;
                                var num = lastCorpID.substring(1);
                                num++;
                                if (String(num).length < 5) {
                                    num = (Array(5).join(0) + num).slice(-5)
                                }
                                var newCorpID = "A" + num;
                                logger.info(lastCorpID, num, newCorpID);
                                var addCorpInfoArr = [newCorpID, corp_name, corp_bankNo, corp_principal, corp_prinPhone, corp_email, corp_prinRemark, corp_settleType, corp_returnGoods, corp_type, group_ID, corp_address, set_open_status];
                                connection.query($sql.TaddCorpInfo, addCorpInfoArr, function (err, result) {
                                    if (err) { //新增商户信息错误
                                        logger.info("新增商户信息错误。错误编号：00125");
                                        var message = "抱歉，新增商户信息错误。错误编号：00125，返回供应商管理页";
                                        var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                        res.send(re);
                                        connection.release();
                                    } else { //新增商户信息成功
                                        connection.release();
                                        logger.info("新增商户信息成功");
                                        var message = "新增商户信息成功";
                                        var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                        res.send(re);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        });
    },
    // TcorpInfoAdmin 修改供应商启用状态
    changeCorpOpenStatus: function (res, req) {
        var corpID = req.query.changeCorpOpenStatus;
        var teacherName = req.session.username;
        logger.info(teacherName + "进入changeCorpOpenStatus函数");
        var setCorpStatusArr = [];
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00126");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00126，返回供应商管理页";
                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TcorpOpenStatus, corpID, function (err, result) {
                if (err) { //供应商启用状态查询错误
                    logger.info("供应商启用状态查询错误。错误编号：00127");
                    var message = "抱歉，供应商启用状态查询错误。错误编号：00127，返回供应商管理页";
                    var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //供应商启用状态查询成功
                    if (result[0].状态 == 1) { //要修改为禁用
                        setCorpStatusArr = [0, corpID];
                        logger.info("供应商启用状态:", result, "修改目标:", setCorpStatusArr);
                        connection.query($sql.TchangeCorpOpenStatus, setCorpStatusArr, function (err, result) {
                            if (err) { //供应商启用状态更改错误
                                logger.info("供应商启用状态更改错误。错误编号：00128");
                                var message = "抱歉，供应商启用状态更改错误。错误编号：00128，返回供应商管理页";
                                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                res.send(re);
                            } else { //供应商启用状态更改成功
                                connection.release();
                                logger.info("供应商启用状态更改成功");
                                var message = "供应商启用状态更改成功";
                                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                res.send(re);
                            }
                        });
                    } else if (result[0].状态 == 0) { //要修改为启用
                        setCorpStatusArr = [1, corpID];
                        connection.query($sql.TchangeCorpOpenStatus_queryGroupStatus, corpID, function (err, result) {
                            if (err) { //商户所属集团状态查询错误
                                logger.info("商户所属集团状态查询错误。错误编号：00129");
                                var message = "抱歉，商户所属集团状态查询错误。错误编号：00129，返回供应商管理页";
                                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                res.send(re);
                                connection.release();
                            } else { //商户所属集团状态查询成功
                                logger.info("商户所属集团状态查询成功");
                                if (result[0].状态 == 1) {
                                    logger.info("供应商启用状态:", result, "修改目标:", setCorpStatusArr);
                                    connection.query($sql.TchangeCorpOpenStatus, setCorpStatusArr, function (err, result) {
                                        if (err) { //供应商启用状态更改错误
                                            logger.info("供应商启用状态更改错误。错误编号：00130");
                                            var message = "抱歉，供应商启用状态更改错误。错误编号：00130，返回供应商管理页";
                                            var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                            res.send(re);
                                            connection.release();
                                        } else { //供应商启用状态更改成功
                                            connection.release();
                                            logger.info("供应商启用状态更改成功");
                                            var message = "供应商启用状态更改成功";
                                            var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                            res.send(re);
                                        }
                                    });
                                } else {
                                    logger.info("商户所属集团状态为禁用，禁止修改该商户启用状态为“启用”");
                                    var message = "商户所属集团状态为禁用，禁止修改该商户启用状态为“启用”";
                                    var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                                    res.send(re);
                                }
                            }
                        });
                    }
                }
            });
        });
    },
    // TcorpInfoAdmin 筛选供应商信息
    querySiftCorpInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftCorpInfos函数");
        // logger.info(req.body);
        var corpID = req.body.corpID;
        var corpName = req.body.corpName;
        var corpBankNo = req.body.corpBankNo;
        var corpPrincipal = req.body.corpPrincipal;
        var corpPrinPhone = req.body.corpPrinPhone;
        var corpSettleType = req.body.corpSettleType;
        var corpReturnGoods = req.body.corpReturnGoods;
        var corpType = req.body.corpType;
        var groupID = req.body.groupID;
        var corpOpenStatus = req.body.corpOpenStatus;
        var sift = [corpID, corpName, corpBankNo, corpPrincipal, corpPrinPhone, corpSettleType, corpReturnGoods, corpType, groupID, corpOpenStatus];
        var mark = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        var sql = "select * from 商户信息表";
        var k = 10;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 商户代码 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 商户名称 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 商户银行账号 = " + sift[2];
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 商户对账联系人 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 商户对账联系人电话 = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            if (sift[5] == "全款结算") {
                sql += " 结算类型 = 1";
                if (--k > 0) {
                    sql += " AND";
                }
            } else if (sift[5] == "分期结算") {
                sql += " 结算类型 = 2";
                if (--k > 0) {
                    sql += " AND";
                }
            }
        }
        if (mark[6] == 1) {
            sql += " 是否支持退货 = " + "'" + sift[6] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[7] == 1) {
            sql += " 商户类型 = " + "'" + sift[7] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[8] == 1) {
            sql += " 集团编号 = " + "'" + sift[8] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[9] == 1) {
            if (sift[9] == "启用") {
                sql += " 状态 = 1";
            } else if (sift[9] == "禁用") {
                sql += " 状态 = 0";
            }
        }
        sql += " ORDER BY 商户代码 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00131");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00131，返回供应商管理页";
                var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 供应商信息查询错误
                    logger.info("供应商信息查询错误。错误编号：00132");
                    var message = "抱歉，供应商信息查询错误。错误编号：00132，返回供应商管理页";
                    var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无供应商信息
                    logger.info("无供应商信息");
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供应商信息页错误。错误编号：00133");
                            var message = "抱歉，刷新供应商信息页错误。错误编号：00133，返回供应商管理页";
                            var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有供应商信息
                    // logger.info(result);
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供应商信息页错误。错误编号：00134");
                            var message = "抱歉，刷新供应商信息页错误。错误编号：00134，返回供应商管理页";
                            var re = `<script>alert('${message}'); location.href="/TcorpInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TproductListAdmin 缴费项目管理页信息
    queryTproductList: function (account, res, req) {
        logger.info(account + "进入queryTproductList函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //
                logger.info("数据库连接池错误。错误编号：00135");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00135，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TproductList, function (err, result) {
                if (err) { //缴费项目查询错误
                    logger.info("缴费项目查询错误。错误编号：00136");
                    var message = "抱歉，缴费项目查询错误。错误编号：00136，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无缴费项目
                    logger.info("无缴费项目");
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费项目页错误。错误编号：00137");
                            var message = "抱歉，刷新缴费项目页错误。错误编号：00137，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费项目
                    // logger.info(result);
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费项目页错误。错误编号：00138");
                            var message = "抱歉，刷新缴费项目页错误。错误编号：00138，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TproductListAdmin 修改商品上架状态
    changeProductOpenStatus: function (res, req) {
        var productID = req.query.changeProductOpenStatus;
        var teacherName = req.session.username;
        logger.info(teacherName + "进入changeProductOpenStatus函数");
        var setProductStatusArr = [];
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00139");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00139，返回缴费项目管理页";
                var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TproductOpenStatus, productID, function (err, result) {
                if (err) { //缴费项目上架状态查询错误
                    logger.info("缴费项目上架状态查询错误。错误编号：00140");
                    var message = "抱歉，缴费项目上架状态查询错误。错误编号：00140，返回缴费项目管理页";
                    var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //缴费项目上架状态查询成功
                    if (result[0].商品状态 == 1) {
                        setProductStatusArr = [0, productID];
                    } else if (result[0].商品状态 == 0) {
                        setProductStatusArr = [1, productID];
                    }
                    logger.info("缴费项目上架状态:", result, setProductStatusArr);
                    connection.query($sql.TchangeProductOpenStatus, setProductStatusArr, function (err, result) {
                        if (err) { //缴费项目上架状态更改错误
                            logger.info("缴费项目上架状态更改错误。错误编号：00141");
                            var message = "抱歉，缴费项目上架状态更改错误。错误编号：00141，返回缴费项目管理页";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //缴费项目上架状态更改成功
                            connection.release();
                            logger.info("缴费项目上架状态更改成功");
                            var message = "缴费项目上架状态更改成功";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TproductListAdmin 新增商品信息
    addProductInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addProductInfo函数");
        var product_name = req.body.product_name;
        var product_price = req.body.product_price;
        var product_corpID = req.body.product_corpID;
        var product_openStatus = req.body.product_openStatus;
        var product_attri1st = req.body.product_attri1st;
        var product_attri2nd = req.body.product_attri2nd;
        var product_attri3rd = req.body.product_attri3rd;
        var product_remark = req.body.product_remark;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00142");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00142，返回缴费项目管理页";
                var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TaddProductInfo_queryLastProductID, function (err, result) {
                if (err) { //查询最后一个商品id错误
                    logger.info("查询最后一个商品id错误。错误编号：00143");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00143，返回缴费项目管理页";
                    var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //查询最后一个商品id成功
                    logger.info("查询最后一个商品id成功");
                    var lastProductID = result[0].商品编号;
                    var num = lastProductID.substring(1);
                    num++;
                    if (String(num).length < 6) {
                        num = (Array(6).join(0) + num).slice(-6)
                    }
                    var newProductID = "S" + num;
                    // logger.info(lastProductID, num, newProductID);
                    var addProductInfoArr = [newProductID, product_name, product_price, product_corpID, product_openStatus, product_attri1st, product_attri2nd, product_attri3rd, product_remark];
                    // logger.info(addProductInfoArr);
                    connection.query($sql.TaddProductInfo, addProductInfoArr, function (err, result) {
                        if (err) { //新增商品信息错误
                            logger.info("新增商品信息错误。错误编号：00144");
                            var message = "抱歉，新增商品信息错误。错误编号：00144，返回缴费项目管理页";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //新增商品信息成功
                            connection.release();
                            logger.info("新增商品信息成功");
                            var message = "新增商品信息成功";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TproductListAdmin 筛选商品信息
    querySiftProductListInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftProductListInfo函数");
        var productID = req.body.productID;
        var productName = req.body.productName;
        var corpID = req.body.corpID;
        var productOpenStatus = req.body.productOpenStatus;
        var sift = [productID, productName, corpID, productOpenStatus];
        var mark = [1, 1, 1, 1];
        var sql = "select * from 商品清单";
        var k = 4;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 商品编号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 商品名称 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 商户代码 = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            if (sift[3] == "上架") {
                sql += " 商品状态 = 1";
            } else if (sift[3] == "下架") {
                sql += " 商品状态 = 0";
            }
        }
        sql += " ORDER BY 商品编号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00145");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00145，返回缴费项目管理页";
                var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 商品信息查询错误
                    logger.info("商品信息查询错误。错误编号：00146");
                    var message = "抱歉，商品信息查询错误。错误编号：00146，返回缴费项目管理页";
                    var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无商品信息
                    logger.info("无商品信息");
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息错误。错误编号：00147");
                            var message = "抱歉，刷新商品信息错误。错误编号：00147，返回缴费项目管理页";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商品信息
                    // logger.info(result);
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息错误。错误编号：00148");
                            var message = "抱歉，刷新商品信息错误。错误编号：00148，返回缴费项目管理页";
                            var re = `<script>alert('${message}'); location.href="/TproductListAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TallOrdersAdmin 缴费订单管理页信息
    queryTallOrders: function (account, res, req) {
        logger.info(account + "进入queryTallOrders函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00149");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00149，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TallOrders, function (err, result) {
                if (err) { // 缴费订单查询错误
                    logger.info("缴费订单查询错误。错误编号：00150");
                    var message = "抱歉，缴费订单查询错误。错误编号：00150，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无 缴费订单
                    logger.info("无缴费订单");
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费订单页错误。错误编号：00151");
                            var message = "抱歉，缴费订单查询错误。错误编号：00151，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费订单
                    // logger.info(result);
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费订单页错误。错误编号：00152");
                            var message = "抱歉，缴费订单查询错误。错误编号：00152，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TallOrdersAdmin 教师端删除缴费订单
    TdeleteOrder: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入TdeleteOrder函数");
        var orderID = req.query.TdeleteOrder;
        // res.send(orderID);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00153");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00153，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteOrderRecord, [orderID, orderID], function (err, result) {
                if (err) { //教师端删除缴费订单错误
                    logger.info("教师端删除缴费订单错误。错误编号：00154");
                    var message = "抱歉，教师端删除缴费订单错误。错误编号：00154，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //教师端删除缴费订单成功
                    logger.info("教师端删除缴费订单结果：", result);
                    connection.release();
                    var message = "删除缴费订单成功";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TallOrdersAdmin 筛选订单记录
    querySiftAllOrders: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftAllOrders函数");
        // logger.info(req.body);
        var stuID = req.body.stuID;
        var orderID = req.body.orderID;
        var subOrderID = req.body.subOrderID;
        var productID = req.body.productID;
        var productName = req.body.productName;
        var corpName = req.body.corpName;
        var paymentStatus = req.body.paymentStatus;
        var sift = [stuID, orderID, subOrderID, productID, productName, corpName, paymentStatus];
        var mark = [1, 1, 1, 1, 1, 1, 1];
        var sql = "SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态`,`订单信息表`.`创建时间`,`订单信息表`.`支付时间`,`订单信息表`.`支付期限`,`订单信息表`.`支付失败原因`,`订单信息表`.`支付渠道` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE (`订单信息表`.`订单支付状态` = 2 OR `订单信息表`.`订单支付状态` = 3)";
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (mark[0] == 1) {
            sql += " AND `订单信息表`.`学号` = " + "'" + sift[0] + "'";
        }
        if (mark[1] == 1) {
            sql += " AND `子订单信息表`.`订单编号` = " + sift[1];
        }
        if (mark[2] == 1) {
            sql += " AND `子订单信息表`.`子订单编号` = " + "'" + sift[2] + "'";
        }
        if (mark[3] == 1) {
            sql += " AND `子订单信息表`.`商品编号` = " + "'" + sift[3] + "'";
        }
        if (mark[4] == 1) {
            sql += " AND `商品清单`.`商品名称` = " + "'" + sift[4] + "'";
        }
        if (mark[5] == 1) {
            sql += " AND `商户信息表`.`商户名称` = " + "'" + sift[5] + "'";
        }
        if (mark[6] == 1) {
            if (req.body.paymentStatus == "待缴费(必缴)") {
                sql += " AND `订单信息表`.`订单支付状态` = 3";
            } else if (req.body.paymentStatus == "待缴费(选缴)") {
                sql += " AND (`订单信息表`.`订单支付状态` = 2)";
            }

        }
        sql += " ORDER BY `订单信息表`.`订单支付状态` DESC,`子订单信息表`.`子订单编号` DESC,`订单信息表`.`学号` ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00155");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00155，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 缴费订单查询错误
                    logger.info("缴费订单查询错误。错误编号：00156");
                    var message = "抱歉，缴费订单查询错误。错误编号：00156，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无缴费订单
                    logger.info("无缴费订单");
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费订单页错误。错误编号：00157");
                            var message = "抱歉，刷新缴费订单页错误。错误编号：00157，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费订单
                    // logger.info(result);
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费订单页错误。错误编号：00158");
                            var message = "抱歉，刷新缴费订单页错误。错误编号：00158，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TpaymentRecordsAdmin 缴费记录管理页信息
    queryTpaymentRecords: function (account, res, req) {
        logger.info(account + "进入queryTpaymentRecords函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00159");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00159，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TpaymentRecords, function (err, result) {
                if (err) { // 缴费记录查询错误
                    logger.info("缴费记录查询错误。错误编号：00159");
                    var message = "抱歉，缴费记录查询错误。错误编号：00159，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无 缴费记录
                    logger.info("无缴费记录");
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费记录页错误。错误编号：00160");
                            var message = "抱歉，刷新缴费记录页错误。错误编号：00160，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费记录
                    // logger.info(result);
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费记录页错误。错误编号：00161");
                            var message = "抱歉，刷新缴费记录页错误。错误编号：00161，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TpaymentRecordsAdmin 教师端删除缴费记录(与学生端删除缴费记录使用同一条sql：$sql.TdeleteOrderRecord)
    TdeleteOrderRecord: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入TdeleteOrderRecord函数");
        var orderID = req.query.deleteOrderRecord;
        // res.send(orderID);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00162");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00162，返回缴费记录管理页";
                var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteOrderRecord, [orderID, orderID], function (err, result) {
                if (err) { //教师端删除缴费记录错误
                    logger.info("教师端删除缴费记录错误。错误编号：00163");
                    var message = "抱歉，教师端删除缴费记录错误。错误编号：00163，返回缴费记录管理页";
                    var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //教师端删除缴费记录成功
                    logger.info("教师端删除缴费记录结果：", result);
                    connection.release();
                    var message = "删除缴费记录成功";
                    var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TpaymentRecordsAdmin 筛选缴费记录
    querySiftPaymentRecords: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftPaymentRecords函数");
        // logger.info(req.body);
        var stuID = req.body.stuID;
        var orderID = req.body.orderID;
        var subOrderID = req.body.subOrderID;
        var productID = req.body.productID;
        var productName = req.body.productName;
        var corpName = req.body.corpName;
        var paymentStatus = req.body.paymentStatus;
        var sift = [stuID, orderID, subOrderID, productID, productName, corpName, paymentStatus];
        var mark = [1, 1, 1, 1, 1, 1, 1];
        var sql = "SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态`,`订单信息表`.`创建时间`,`订单信息表`.`支付时间`,`订单信息表`.`支付期限`,`订单信息表`.`支付失败原因`,`订单信息表`.`支付渠道` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE (`订单信息表`.`订单支付状态` = 0 OR `订单信息表`.`订单支付状态` = 1 OR `订单信息表`.`订单支付状态` = 4 OR `订单信息表`.`订单支付状态` = 5)";
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (mark[0] == 1) {
            sql += " AND `订单信息表`.`学号` = " + "'" + sift[0] + "'";
        }
        if (mark[1] == 1) {
            sql += " AND `子订单信息表`.`订单编号` = " + sift[1];
        }
        if (mark[2] == 1) {
            sql += " AND `子订单信息表`.`子订单编号` = " + "'" + sift[2] + "'";
        }
        if (mark[3] == 1) {
            sql += " AND `子订单信息表`.`商品编号` = " + "'" + sift[3] + "'";
        }
        if (mark[4] == 1) {
            sql += " AND `商品清单`.`商品名称` = " + "'" + sift[4] + "'";
        }
        if (mark[5] == 1) {
            sql += " AND `商户信息表`.`商户名称` = " + "'" + sift[5] + "'";
        }
        if (mark[6] == 1) {
            if (req.body.paymentStatus == "缴费成功") {
                sql += " AND `订单信息表`.`订单支付状态` = 1";
            } else if (req.body.paymentStatus == "缴费失败") {
                sql += " AND (`订单信息表`.`订单支付状态` = 0 OR `订单信息表`.`订单支付状态` = 4 OR `订单信息表`.`订单支付状态` = 5)";
            }

        }
        sql += " ORDER BY `订单信息表`.`订单支付状态` ASC,`子订单信息表`.`子订单编号` DESC,`订单信息表`.`学号` ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00164");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00164，返回缴费记录管理页";
                var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 缴费记录查询错误
                    logger.info("缴费记录查询错误。错误编号：00165");
                    var message = "抱歉，缴费记录查询错误。错误编号：00165，返回缴费记录管理页";
                    var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无缴费记录
                    logger.info("无缴费记录");
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费记录页错误。错误编号：00166");
                            var message = "抱歉，缴费记录查询错误。错误编号：00166，返回缴费记录管理页";
                            var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费记录
                    // logger.info(result);
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新缴费记录页错误。错误编号：00167");
                            var message = "抱歉，缴费记录查询错误。错误编号：00167，返回缴费记录管理页";
                            var re = `<script>alert('${message}'); location.href="/TpaymentRecordsAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TstockListAdmin 供货管理页信息
    queryTstockList: function (account, res, req) {
        logger.info(account + "进入queryTstockList函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00168");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00168，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TstockList, function (err, result) {
                if (err) { // 供货管理查询错误
                    logger.info("供货管理查询错误。错误编号：00169");
                    var message = "抱歉，供货管理查询错误。错误编号：00169，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无供货管理
                    logger.info("无供货管理");
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供货管理页错误。错误编号：00170");
                            var message = "抱歉，供货管理查询错误。错误编号：00170，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有供货管理
                    // logger.info(result);
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新供货管理页错误。错误编号：00171");
                            var message = "抱歉，供货管理查询错误。错误编号：00171，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TstockListAdmin 删除采购记录
    deleteStockRecord: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入deleteStockRecord函数");
        var stockID = req.query.deleteStockRecord;
        // res.send(stockID);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00172");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00172，返回供货管理页";
                var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteStockRecord, [stockID, stockID], function (err, result) {
                if (err) { //教师端删除采购记录错误
                    logger.info("教师端删除采购记录错误。错误编号：00173");
                    var message = "抱歉，教师端删除采购记录错误。错误编号：00173，返回供货管理页";
                    var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //教师端删除采购记录成功
                    logger.info("教师端删除采购记录结果：", result);
                    connection.release();
                    var message = "删除采购记录成功";
                    var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TstockListAdmin 筛选采购记录
    querySiftStocks: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftStocks函数");
        // logger.info(req.body);
        var stockID = req.body.stockID;
        var subStockID = req.body.subStockID;
        var productID = req.body.productID;
        var productName = req.body.productName;
        var corpID = req.body.corpID;
        var corpName = req.body.corpName;
        var groupName = req.body.groupName;
        var sift = [stockID, subStockID, productID, productName, corpID, corpName, groupName];
        var mark = [1, 1, 1, 1, 1, 1, 1];
        var sql = "SELECT `子进货表`.`子采购编号`, `子进货表`.`采购编号`, `子进货表`.`商品编号`, `子进货表`.`商品单价`, `子进货表`.`数量`, `子进货表`.`子采购总额`, `进货表`.`金额`, `进货表`.`供应商商户号`, `进货表`.`供应商名称`, `进货表`.`集团编号`,`商品清单`.`商品名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `进货表` INNER JOIN `子进货表` ON `进货表`.`采购编号` = `子进货表`.`采购编号` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子进货表`.`商品编号`";
        var k = 7;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " `子进货表`.`采购编号` = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " `子进货表`.`子采购编号` = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " `子进货表`.`商品编号` = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " `商品清单`.`商品名称` = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " `进货表`.`供应商商户号` = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            sql += " `进货表`.`供应商名称` = " + "'" + sift[5] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[6] == 1) {
            sql += " `进货表`.`集团编号` = " + "'" + sift[6] + "'";
        }
        sql += " ORDER BY `子进货表`.`子采购编号` ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00174");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00174，返回供货管理页";
                var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 采购信息查询错误
                    logger.info("采购信息查询错误。错误编号：00175");
                    var message = "抱歉，采购信息查询错误。错误编号：00175，返回供货管理页";
                    var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无采购信息
                    logger.info("无采购信息");
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新采购信息页错误。错误编号：00176");
                            var message = "抱歉，采购信息查询错误。错误编号：00176，返回供货管理页";
                            var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有采购信息
                    // logger.info(result);
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新采购信息页错误。错误编号：00177");
                            var message = "抱歉，采购信息查询错误。错误编号：00177，返回供货管理页";
                            var re = `<script>alert('${message}'); location.href="/TstockListAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TcoursePlansAdmin 教材计划管理页信息
    queryTcoursePlans: function (account, res, req) {
        logger.info(account + "进入queryTcoursePlans函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00178");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00178，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TcoursePlans, function (err, result) {
                if (err) { // 教材计划查询错误
                    logger.info("教材计划查询错误。错误编号：00179");
                    var message = "抱歉，教材计划查询错误。错误编号：00179，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无教材计划
                    logger.info("无教材计划");
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新教材计划页错误。错误编号：00180");
                            var message = "抱歉，刷新教材计划页错误。错误编号：00180，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有教材计划
                    // logger.info(result);
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新教材计划页错误。错误编号：00181");
                            var message = "抱歉，刷新教材计划页错误。错误编号：00181，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcoursePlansAdmin 插入新增教材计划信息
    addCoursePlanInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addCoursePlanInfo函数");
        var textBook_name = req.body.textBook_name;
        var coursePlan_school = req.body.coursePlan_school;
        var coursePlan_major = req.body.coursePlan_major;
        var coursePlan_term = req.body.coursePlan_term;
        var coursePlan_courseName = req.body.coursePlan_courseName;
        var coursePlan_price = req.body.coursePlan_price;
        var coursePlan_publishingHouse = req.body.coursePlan_publishingHouse;
        var textBook_ID = "";
        // 插入数据
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00182");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00182，返回教材计划管理页";
                var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                res.send(re);
                return console.error(error);
            }
            // 查询最后一个商品id
            connection.query($sql.TcoursePlansUpload_queryLastProductID, function (err, result) {
                if (err) {
                    connection.release();
                    logger.info("查询最后一个商品id错误。错误编号：00183");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00183，返回教材计划管理页";
                    var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                    res.send(re);
                    return console.error(error);
                } else {
                    logger.info('查询最后一个商品id成功');
                    var lastProductID = result[0].商品编号;
                    var num = lastProductID.substring(1);
                    num++;
                    if (String(num).length < 6) {
                        num = (Array(6).join(0) + num).slice(-6)
                    }
                    var newProductID = "S" + num;
                    textBook_ID = newProductID;
                    // logger.info(lastProductID, num, newProductID);
                    TcoursePlansUploadParams = [textBook_ID, coursePlan_school, coursePlan_price, coursePlan_major, coursePlan_term, coursePlan_courseName, textBook_name, coursePlan_publishingHouse, newProductID, textBook_name, coursePlan_price, 'A00006', 0, coursePlan_major, coursePlan_term, coursePlan_courseName, ''];
                    logger.info("待新增教材计划参数TcoursePlansUploadParams:", TcoursePlansUploadParams);
                    // varTcoursePlansUploadParams2 = [newProductID, textBook_name, coursePlan_price, 'A00006', 0, coursePlan_major, coursePlan_term, coursePlan_courseName, ''];
                    connection.query($sql.TcoursePlansUpload, TcoursePlansUploadParams, function (err, result) {
                        // logger.info("TcoursePlansUploadParams[k]:",k,TcoursePlansUploadParams[k]);
                        if (err) {
                            connection.release();
                            logger.info("教材计划上传失败。错误编号：00184");
                            var message = "抱歉，教材计划上传失败。错误编号：00184，返回教材计划管理页";
                            var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                            res.send(re);
                        } else {
                            logger.info('教材计划上传成功');
                            connection.release();
                            var message = "教材计划上传成功";
                            var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                            res.send(re);
                        }
                    })
                }
            })

        });
    },
    // TcoursePlansAdmin 删除教材计划
    deleteCoursePlan: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入deleteCoursePlan函数");
        var coursePlanID = req.query.deleteCoursePlan;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00185");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00185，返回教材计划管理页";
                var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteCoursePlan, [coursePlanID, coursePlanID], function (err, result) {
                if (err) { //删除教材计划错误
                    logger.info("删除教材计划错误。错误编号：00186");
                    var message = "抱歉，删除教材计划错误。错误编号：00186，返回教材计划管理页";
                    var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //删除教材计划成功
                    logger.info("删除教材计划成功结果：", result);
                    connection.release();
                    var message = "删除教材计划成功";
                    var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TcoursePlansAdmin 筛选教材计划信息
    querySiftCoursePlans: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftCoursePlans函数");
        // logger.info(req.body);
        var textBookID = req.body.textBookID;
        var textBookName = req.body.textBookName;
        var school = req.body.school;
        var major = req.body.major;
        var schoolTerm = req.body.schoolTerm;
        var courseName = req.body.courseName;
        var textBookprice = req.body.textBookprice;
        var publishingHouse = req.body.publishingHouse;
        var sift = [textBookID, school, textBookprice, major, schoolTerm, courseName, textBookName, publishingHouse];
        var mark = [1, 1, 1, 1, 1, 1, 1, 1];
        var sql = "select * from 教材计划";
        var k = 8;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 教材代码 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 学院 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 单价 = " + sift[2];
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 专业 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 学期 = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            sql += " 课程名 = " + "'" + sift[5] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[6] == 1) {
            sql += " 教材名 = " + "'" + sift[5] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[7] == 1) {
            sql += " 出版社 = " + "'" + sift[6] + "'";
        }
        sql += " ORDER BY 教材代码 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00188");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00188，返回教材计划管理页";
                var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 教材计划查询错误
                    logger.info("教材计划查询错误。错误编号：00189");
                    var message = "抱歉，教材计划查询错误。错误编号：00189，返回教材计划管理页";
                    var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无教材计划
                    logger.info("无教材计划");
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新教材计划页错误。错误编号：00190");
                            var message = "抱歉，教材计划查询错误。错误编号：00190，返回教材计划管理页";
                            var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有教材计划
                    // logger.info(result);
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新教材计划页错误。错误编号：00191");
                            var message = "抱歉，教材计划查询错误。错误编号：00191，返回教材计划管理页";
                            var re = `<script>alert('${message}'); location.href="/TcoursePlansAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TclearInfoAdmin 清算统计页信息
    queryTclearInfo: function (account, res, req) {
        logger.info(account + "进入queryTclearInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00192");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00192，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TclearInfo, function (err, result) {
                if (err) { // 清算统计查询错误
                    logger.info("清算统计查询错误。错误编号：00193");
                    var message = "抱歉，清算统计查询错误。错误编号：00193，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无清算统计
                    logger.info("无清算统计");
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新清算统计页错误。错误编号：00194");
                            var message = "抱歉，刷新清算统计页错误。错误编号：00194，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有清算统计
                    // logger.info(result);
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新清算统计页错误。错误编号：00195");
                            var message = "抱歉，刷新清算统计页错误。错误编号：00195，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TclearInfoAdmin 删除清算记录
    deleteTclearInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入deleteTclearInfo函数");
        var clearInfoID = req.query.deleteClearInfo;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00196");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00196，返回清算统计页";
                var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteClearInfo, clearInfoID, function (err, result) {
                if (err) { //删除清算记录错误
                    logger.info("删除清算记录错误。错误编号：00197");
                    var message = "抱歉，删除清算记录错误。错误编号：00197，返回清算统计页";
                    var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //删除清算记录成功
                    logger.info("删除清算记录成功结果：", result);
                    connection.release();
                    var message = "删除清算记录成功";
                    var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TclearInfoAdmin 筛选清算记录
    querySiftClearInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftClearInfo函数");
        // logger.info(req.body);
        var clearID = req.body.clearID;
        var stockID = req.body.stockID;
        var depositStatus = req.body.depositStatus;
        var remainingPaymentStatus = req.body.remainingPaymentStatus;
        // if(req.body.depositStatus == "已支付"){
        //     var depositStatus = 1;
        // }else if(req.body.depositStatus == "未支付"){
        //     var depositStatus = 0;
        // }
        // if(req.body.remainingPaymentStatus == "已结算"){
        //     var remainingPaymentStatus = 1;
        // }else if(req.body.remainingPaymentStatus == "未结算"){
        //     var remainingPaymentStatus = 0;
        // }
        var sift = [clearID, stockID, depositStatus, remainingPaymentStatus];
        var mark = [1, 1, 1, 1];
        var sql = "SELECT * FROM 清算表";
        var k = 4;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 清算号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 采购编号 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            if (sift[2] == "已支付") {
                sql += " 定金状态 = 1";
                if (--k > 0) {
                    sql += " AND";
                }
            } else if (sift[2] == "未支付") {
                sql += " 定金状态 = 0";
                if (--k > 0) {
                    sql += " AND";
                }
            }
        }
        if (mark[3] == 1) {
            if (sift[3] == "已结算") {
                sql += " 尾款状态 = 1";
            } else if (sift[3] == "未结算") {
                sql += " 尾款状态 = 0";
            }
        }
        sql += " ORDER BY 清算号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00198");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00198，返回清算统计页";
                var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 清算信息查询错误
                    logger.info("清算信息查询错误。错误编号：00199");
                    var message = "抱歉，清算信息查询错误。错误编号：00199，返回清算统计页";
                    var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无清算信息
                    logger.info("无清算信息");
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新清算信息页错误。错误编号：00200");
                            var message = "抱歉，清算信息查询错误。错误编号：00200，返回清算统计页";
                            var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有清算信息
                    // logger.info(result);
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新清算信息页错误。错误编号：00201");
                            var message = "抱歉，清算信息查询错误。错误编号：00201，返回清算统计页";
                            var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TscholarshipInfoAdmin 资金发放管理页信息
    queryTscholarshipInfo: function (account, res, req) {
        logger.info(account + "进入queryTscholarshipInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00202");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00202，返回首页";
                var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                res.send(re);
            }
            connection.query($sql.TscholarshipInfo, function (err, result) {
                if (err) { // 资金发放查询错误
                    logger.info("资金发放查询错误。错误编号：00203");
                    var message = "抱歉，资金发放查询错误。错误编号：00203，返回首页";
                    var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无资金发放
                    // logger.info("无资金发放");
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新资金发放页错误。错误编号：00204");
                            var message = "抱歉，刷新资金发放页错误。错误编号：00204，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有资金发放
                    // logger.info(result);
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新资金发放页错误。错误编号：00205");
                            var message = "抱歉，刷新资金发放页错误。错误编号：00205，返回首页";
                            var re = `<script>alert('${message}'); location.href="/Thome"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TscholarshipInfoAdmin 删除资金发放记录
    deleteScholarship: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入deleteScholarship函数");
        var scholarshipID = req.query.deleteScholarship;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00206");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00206，返回资金发放管理页";
                var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TdeleteScholarship, scholarshipID, function (err, result) {
                if (err) { //删除资金发放记录错误
                    logger.info("删除资金发放记录错误。错误编号：00207");
                    var message = "抱歉，删除资金发放记录错误。错误编号：00207，返回资金发放管理页";
                    var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //删除资金发放记录成功
                    logger.info("删除资金发放记录成功结果：", result);
                    connection.release();
                    var message = "删除资金发放记录成功";
                    var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                    res.send(re);
                }
            });
        });
    },
    // TscholarshipInfoAdmin 插入新增资金发放信息
    addScholarshipInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入addScholarshipInfo函数");
        var stu_id = req.body.stu_id;
        var scholarship_type = req.body.scholarship_type;
        var scholarship_name = req.body.scholarship_name;
        var scholarship_gread = req.body.scholarship_gread;
        var scholarship_amount = req.body.scholarship_amount;
        var scholarship_channel = req.body.scholarship_channel;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00208");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00208，返回资金发放管理页";
                var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TscholarshipInfoUpload_queryLastScholarshipID, function (err, result) {
                if (err) { //查询最后一个资金发放id错误
                    logger.info("查询最后一个资金发放id错误。错误编号：00209");
                    var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00209，返回资金发放管理页";
                    var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //查询最后一个资金发放id成功
                    logger.info("查询最后一个资金发放id成功");
                    var lastScholarshipID = result[0].发放编号;
                    var num = lastScholarshipID.substring(1);
                    num++;
                    if (String(num).length < 10) {
                        num = (Array(10).join(0) + num).slice(-10)
                    }
                    var scholarshipID = "F" + num;
                    // logger.info(lastScholarshipID, num, scholarshipID);
                    // logger.info((new Date()).getTime()); // js13位时间戳
                    // logger.info(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); // mysql的datetime时间类型
                    var creatTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                    var TscholarshipUploadParams = [scholarshipID, stu_id, scholarship_type, scholarship_name, scholarship_gread, scholarship_amount, creatTime, scholarship_channel];
                    logger.info("待插入的资金发放参数：",TscholarshipUploadParams);
                    connection.query($sql.TscholarshipInfoUpload, TscholarshipUploadParams, function (err, result) {
                        if (err) { //新增资金发放信息错误
                            logger.info("查询新增资金发放信息错误。错误编号：00210");
                            var message = "抱歉，查询新增资金发放信息错误。错误编号：00210，返回资金发放管理页";
                            var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //新增资金发放信息成功
                            connection.release();
                            logger.info("新增资金发放信息成功");
                            var message = "新增资金发放信息成功";
                            var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                            res.send(re);
                        }
                    });
                }
            });
        });
    },
    // TscholarshipInfoAdmin 筛选资金发放记录
    querySiftScholarshipInfo: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftScholarshipInfo函数");
        var scholarshipID = req.body.scholarshipID;
        var stuID = req.body.stuID;
        var scholarshipType = req.body.scholarshipType;
        var scholarshipName = req.body.scholarshipName;
        var scholarshipGread = req.body.scholarshipGread;
        var sift = [scholarshipID, stuID, scholarshipType, scholarshipName, scholarshipGread];
        var mark = [1, 1, 1, 1, 1];
        var sql = "select * from 奖学金信息表";
        var k = 5;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 发放编号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 学号 = " + sift[1];
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 奖学金类型 = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 名称 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 等级 = " + "'" + sift[4] + "'";
        }
        sql += " ORDER BY 发放编号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00211");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00211，返回资金发放管理页";
                var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 资金发放信息查询错误
                    logger.info("资金发放信息查询错误。错误编号：00212");
                    var message = "抱歉，资金发放信息查询错误。错误编号：00212，返回资金发放管理页";
                    var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无资金发放信息
                    logger.info("无资金发放信息");
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新资金发放页错误。错误编号：00213");
                            var message = "抱歉，刷新资金发放页错误。错误编号：00213，返回资金发放管理页";
                            var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有资金发放信息
                    // logger.info(result);
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新资金发放页错误。错误编号：00214");
                            var message = "抱歉，刷新资金发放页错误。错误编号：00214，返回资金发放管理页";
                            var re = `<script>alert('${message}'); location.href="/TscholarshipInfoAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },

    // TcreatOrdersInBatches_CPro 批量创建必缴订单页信息——选择商品
    queryTcreatOrdersInBatches_CPro: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入queryTcreatOrdersInBatches_CPro函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00215");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00215，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TcreatOrdersInBatches_CPro_queryAllProducts, function (err, result) {
                if (err) { // 商品信息查询错误
                    logger.info("商品信息查询错误。错误编号：00216");
                    var message = "抱歉，商品信息查询错误。错误编号：00216，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无商品信息
                    logger.info("无商品信息");
                    ejs.renderFile('views/TcreatOrdersInBatches_CPro.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息页错误。错误编号：00217");
                            var message = "抱歉，刷新商品信息页错误。错误编号：00217，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商品信息
                    // logger.info(result);
                    ejs.renderFile('views/TcreatOrdersInBatches_CPro.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息页错误。错误编号：00218");
                            var message = "抱歉，刷新商品信息页错误。错误编号：00218，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcreatOrdersInBatches_CPro 批量创建必缴订单页信息——筛选商品
    querySiftProductListInfo_CPro: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftProductListInfo_CPro函数");
        var productID = req.body.productID;
        var productName = req.body.productName;
        var corpID = req.body.corpID;
        var corpAttri1 = req.body.corpAttri1;
        var corpAttri2 = req.body.corpAttri2;
        var corpAttri3 = req.body.corpAttri3;
        var sift = [productID, productName, corpID, corpAttri1, corpAttri2, corpAttri3];
        var mark = [1, 1, 1, 1, 1, 1];
        var sql = "select * from 商品清单";
        var k = 6;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 商品编号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 商品名称 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 商户代码 = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 属性1 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 属性2 = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            sql += " 属性3 = " + "'" + sift[5] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        sql += " ORDER BY 商品编号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00219");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00219，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, function (err, result) {
                if (err) { // 商品信息查询错误
                    logger.info("商品信息查询错误。错误编号：00220");
                    var message = "抱歉，商品信息查询错误。错误编号：00220，返回创建必缴订单页";
                    var re = `<script>alert('${message}'); location.href="/TcreatOrdersInBatches_CPro"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无商品信息
                    logger.info("无商品信息");
                    ejs.renderFile('views/TcreatOrdersInBatches_CPro.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息页错误。错误编号：00221");
                            var message = "抱歉，刷新商品信息页错误。错误编号：00221，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商品信息
                    // logger.info(result);
                    ejs.renderFile('views/TcreatOrdersInBatches_CPro.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新商品信息页错误。错误编号：00222");
                            var message = "抱歉，刷新商品信息页错误。错误编号：00222，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcreatOrdersInBatches_CStu 批量创建必缴订单页信息——选择学号
    queryTcreatOrdersInBatches_CStu: function (res, req) {
        var teacherName = req.session.username;
        // var products = req.body.submitData;
        logger.info(teacherName + "进入queryTcreatOrdersInBatches_CStu函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00223");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00223，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            connection.query($sql.TcreatOrdersInBatches_CStu_queryAllStudents, function (err, result) {
                if (err) { // 学生信息查询错误
                    logger.info("学生信息查询错误。错误编号：00224");
                    var message = "抱歉，学生信息查询错误。错误编号：00224，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else if (result[0] == undefined) { //无学生信息
                    logger.info("无学生信息");
                    ejs.renderFile('views/TcreatOrdersInBatches_CStu.ejs', {
                        result: result,
                        // products: products,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00225");
                            var message = "抱歉，学生信息查询错误。错误编号：00225，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有学生信息
                    // logger.info(result);
                    ejs.renderFile('views/TcreatOrdersInBatches_CStu.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00226");
                            var message = "抱歉，学生信息查询错误。错误编号：00226，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcreatOrdersInBatches_CStu 批量创建必缴订单页信息——筛选学号
    querySiftStuInfo_CStu: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入querySiftStuInfo_CStu函数");
        // logger.info(req.body);
        var stuID = req.body.stuID;
        var stuName = req.body.stuName;
        var stuSchool = req.body.stuSchool;
        var stuMajor = req.body.stuMajor;
        var sex = req.body.sex;
        var grade = req.body.grade;
        var sift = [stuID, stuName, stuSchool, stuMajor, sex, grade];
        var mark = [1, 1, 1, 1, 1, 1];
        var sql = "select * from 用户信息表";
        var k = 6;
        for (var i = 0; i < sift.length; i++) {
            if (sift[i] == '' || sift[i] == 0 || sift[i] == undefined) {
                mark[i] = 0;
                k--;
            }
        }
        // logger.info(sift);
        // logger.info(mark);
        if (k > 0) {
            sql += " WHERE"
        }
        if (mark[0] == 1) {
            sql += " 学号 = " + "'" + sift[0] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[1] == 1) {
            sql += " 姓名 = " + "'" + sift[1] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[2] == 1) {
            sql += " 院系 = " + "'" + sift[2] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[3] == 1) {
            sql += " 专业 = " + "'" + sift[3] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[4] == 1) {
            sql += " 性别 = " + "'" + sift[4] + "'";
            if (--k > 0) {
                sql += " AND";
            }
        }
        if (mark[5] == 1) {
            sql += " 年级 = " + "'" + sift[5] + "'";
        }
        sql += " ORDER BY 学号 ASC;"
        // logger.info("sql:", sql);
        // res.send(sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00227");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00227，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
                connection.release();
            }
            connection.query(sql, function (err, result) {
                if (err) { // 学生信息查询错误
                    connection.release();
                    logger.info("学生信息查询错误。错误编号：00228");
                    var message = "抱歉，学生信息查询错误。错误编号：00228，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                } else if (result[0] == undefined) { //无学生信息
                    logger.info("无学生信息");
                    ejs.renderFile('views/TcreatOrdersInBatches_CStu.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00229");
                            var message = "抱歉，刷新学生信息页错误。错误编号：00229，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有学生信息
                    // logger.info(result);
                    ejs.renderFile('views/TcreatOrdersInBatches_CStu.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            logger.info("刷新学生信息页错误。错误编号：00230");
                            var message = "抱歉，刷新学生信息页错误。错误编号：00230，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    // TcreatOrdersInBatches_Window 批量创建必缴订单页信息——设置缴费窗口
    TcreatOrdersInBatches_Window: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入TcreatOrdersInBatches_Window函数");
        var pro_stu = req.body.submitData;
        var pro_stuObj = JSON.parse(pro_stu); //由JSON字符串转换为JSON对象
        var pro_stuObjKey = Object.keys(pro_stuObj); //为arr object类型
        // logger.info("get submitDataObj(pro_stuObj):", pro_stuObj);
        // logger.info("get pro_stuObjKey:", pro_stuObjKey);
        var proData = []; // 商品数组
        var proDataNum = []; //商品数量数组
        var stuData = []; //学号数组
        for (var item in pro_stuObjKey) {
            var itemToString = JSON.stringify(pro_stuObjKey[item]);
            var itemToString = itemToString.slice(1, -1);
            // logger.info('itemToString:', itemToString);
            if (itemToString.indexOf("S") != -1) {
                proData.push(itemToString);
                proDataNum.push(pro_stuObj[itemToString]);
            } else {
                stuData.push(itemToString);
            }
        }
        // logger.info("proData:", proData);
        // logger.info("proDataNum:", proDataNum);
        // logger.info("stuData:", stuData);
        ejs.renderFile('views/TcreatOrdersInBatches_Window.ejs', {
            proData: proData,
            proDataNum: proDataNum,
            stuData: stuData,
            teacherName
        }, function (err, data) {
            if (err) {
                logger.info("刷新设置缴费窗口页错误。错误编号：00231");
                var message = "抱歉，刷新设置缴费窗口页错误。错误编号：00231，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
            }
            res.end(data);
        })
    },
    // TcreatOrdersInBatches_Window 批量创建必缴订单页信息——创建必缴订单
    TcreatOrdersInBatches_CreatOrders: function (res, req) {
        var teacherName = req.session.username;
        logger.info(teacherName + "进入TcreatOrdersInBatches_CreatOrders函数");
        var limitDate = req.body.txtDate; //2020-04-12 string 
        limitDate += " 00:00:00"; //2020-04-12 00:00:00 格式
        // logger.info(limitDate, typeof (limitDate));
        var pro_stu = req.body.submitData; // {"1607400496":"true","1607400499":"true","S000282":"1","S000285":"1","S000286":"1","S000283":"1","S000284":"1","S000281":"1"}

        // 以下同TcreatOrdersInBatches_Window函数，提取商品+数量+学号数据
        var pro_stuObj = JSON.parse(pro_stu); //由JSON字符串转换为JSON对象
        var pro_stuObjKey = Object.keys(pro_stuObj); //为arr object类型
        // logger.info("get submitDataObj(pro_stuObj):", pro_stuObj);
        // logger.info("get pro_stuObjKey:", pro_stuObjKey);
        var proData = []; // 商品数组
        var proDataNum = []; //商品数量数组
        var stuData = []; //学号数组
        for (var item in pro_stuObjKey) {
            var itemToString = JSON.stringify(pro_stuObjKey[item]);
            var itemToString = itemToString.slice(1, -1);
            // logger.info('itemToString:', itemToString);
            if (itemToString.indexOf("S") != -1) {
                proData.push(itemToString);
                proDataNum.push(pro_stuObj[itemToString]);
            } else {
                stuData.push(itemToString);
            }
        }
        // logger.info("proData:", proData);
        // logger.info("proDataNum:", proDataNum);
        // logger.info("stuData:", stuData);

        // 以下为创建商品编号+数量json对象
        var data = {};
        for (var i = 0; i < proData.length; i++) {
            data[proData[i]] = proDataNum[i];
        }
        // logger.info(data);//{ S000284: '1', S000285: '1', S000286: '1' }

        // // 以下为创建供货信息拼接sql中IN的字符串// 此处无效，是错误的，应该直接传入数组[proData]
        // var proStr = "";
        // for (var i = 0; i < proData.length; i++) {
        //     if (i == 0) {
        //         proStr += "'" + proData[i] + "'";
        //     } else {
        //         proStr += "," + "'" + proData[i] + "'";
        //     }
        // }
        // logger.info("proStr:",proStr);

        // 以下为创建必缴订单&子订单
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00232");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00232，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
                connection.release();
            }
            // logger.info(data); // { S000284: '1', S000285: '1', S000286: '1' }

            // 插入订单信息
            // logger.info((new Date()).getTime()); // js13位时间戳
            var creattime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); // mysql的datetime时间类型
            // logger.info(creattime);
            var payLimitTime = limitDate;
            // logger.info(payLimitTime, typeof (payLimitTime));
            var orderid = obj.createRandomId(); // 生成唯一订单号：YYYY-MM-DD+js13位时间戳+7位随机数字
            // res.send(orderid);
            var p = 0;
            for (var j = 0; j < stuData.length; j++) {
                connection.query($sql.TcreatRequiredOrder, [orderid, creattime, stuData[p++], payLimitTime], function (err, result) {
                    if (err) { //订单信息表插入错误
                        logger.info("订单信息表插入错误。错误编号：00233");
                        var message = "抱歉，订单信息表插入错误。错误编号：00233，返回缴费订单管理页";
                        var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                        res.send(re);
                        connection.release();
                    } else { //订单信息表插入成功
                        logger.info("订单信息表插入成功,insertId:",result.insertId);
                        var insertOrderId = result.insertId;
                        // 引用查询商品单价和供应商代码的函数
                        // obj.queryCmmodit(stuData[p], insertOrderId, data, res, req);

                        // 循环查询所有商品单价和供应商代码，并插入子订单信息表
                        var goodsList = Object.keys(data);
                        logger.info("待插入子订单的批量创建必缴商品：",goodsList);
                        var k = 0;
                        for (var i = 0; i < goodsList.length; i++) {
                            connection.query($sql.QueryCmmodit, goodsList[i], function (err, result) {
                                if (err) { //查询商品单价和供应商代码错误
                                    logger.info("查询商品单价和供应商代码错误。错误编号：00234");
                                    var message = "抱歉，查询商品单价和供应商代码错误。错误编号：00234，返回缴费订单管理页";
                                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                    res.send(re);
                                    connection.release();
                                } else {
                                    // logger.info(result);
                                    var Result = JSON.parse(JSON.stringify(result));
                                    // logger.info(Result);
                                    var price = Result[0].商品单价;
                                    var MerchantID = Result[0].商户代码;
                                    // logger.info(price,MerchantID);

                                    // 产生子订单编号
                                    var childOrderID = "";
                                    childOrderID = insertOrderId + obj.PrefixInteger(k + 1, 2);
                                    // logger.info("childOrderID:", childOrderID);

                                    // 订单编号：insertOrderId
                                    // 商品编号：goodsList[i]
                                    // 数量：data.goodsList[i]
                                    // 单价：price
                                    // 子订单总额：data.goodsList[i]*price
                                    // 商户代码：MerchantID
                                    // logger.info(insertOrderId,goodsList[k],data[goodsList[k]],price,data[goodsList[k++]]*price,MerchantID);

                                    var arrChildOrder = [childOrderID, insertOrderId, goodsList[k], parseInt(data[goodsList[k]]), price, data[goodsList[k++]] * price, MerchantID];
                                    logger.info("待插入的批量必缴子订单:",arrChildOrder);
                                    connection.query($sql.InsertChildOrder, arrChildOrder, function (err, result) {
                                        if (err) { //插入子订单错误
                                            logger.info("插入子订单错误。错误编号：00235");
                                            var message = "抱歉，插入子订单错误。错误编号：00235，返回缴费订单管理页";
                                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                            res.send(re);
                                            connection.release();
                                        } else { // SUM查询需要插入订单信息表的订单总额
                                            connection.query($sql.SumOrderAmount, insertOrderId, function (err, result) {
                                                if (err) { //SUM查询订单总额错误
                                                    logger.info("SUM查询订单总额错误。错误编号：00236");
                                                    var message = "抱歉，查询订单总额错误。错误编号：00236，返回缴费订单管理页";
                                                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                                    res.send(re);
                                                    connection.release();
                                                } else { //SUM查询订单总额成功
                                                    // logger.info(insertOrderId, result[0].订单总额);
                                                    var amount = result[0].订单总额;
                                                    connection.query($sql.UpdateOrderAmount, [amount, insertOrderId], function (err, result) {
                                                        if (err) { //更新订单总额错误
                                                            logger.info("更新订单总额错误。错误编号：00237");
                                                            var message = "抱歉，更新订单总额错误。错误编号：00237，返回缴费订单管理页";
                                                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                                            res.send(re);
                                                            connection.release();
                                                        }
                                                    });

                                                }

                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
            connection.release();
        });


        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00238");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00238，返回缴费订单管理页";
                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                res.send(re);
                connection.release();
            }
            // logger.info(data);


            // 以下为创建供货信息
            var stockSucc = false; //控制函数结束
            // 以下为查询商品及商户信息
            var proJsonArr = [];
            var croJsonArr = [];
            var getMark = 0; //控制计算子供货数据

            // 以下为查询商品，getMark++，getMark=1
            connection.query($sql.TinsertStockInfo_queryPro, [proData], function (err, result) {
                if (err) { //查询商品信息错误
                    logger.info("查询商品信息错误。错误编号：00239");
                    var message = "抱歉，查询商品信息错误。错误编号：00239，返回缴费订单管理页";
                    var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //查询商品信息成功//商品编号、商品单价、商户代码
                    logger.info("查询商品信息成功:", result);
                    for (var i = 0; i < result.length; i++) {
                        var proJson = {
                            proID: result[i].商品编号,
                            proPrice: result[i].商品单价,
                            croID: result[i].商户代码
                        };
                        proJsonArr.push(proJson);
                    }
                    logger.info("proJsonArr:", proJsonArr, "type:", typeof (proJsonArr), "getMark:", ++getMark);

                    // 以下为查询商户，getMark++，getMark=2
                    connection.query($sql.TinsertStockInfo_queryCor, [proData], function (err, result) {
                        if (err) { //查询供应商信息错误
                            logger.info("查询供应商信息错误。错误编号：00240");
                            var message = "抱歉，查询供应商信息错误。错误编号：00240，返回缴费订单管理页";
                            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                            res.send(re);
                            connection.release();
                        } else { //查询供应商信息成功 //商户代码、商户名称、集团编号
                            logger.info("查询供应商信息成功:", result);
                            for (var i = 0; i < result.length; i++) {
                                var croJson = {
                                    croID: result[i].商户代码,
                                    croName: result[i].商户名称,
                                    gropID: result[i].集团编号,
                                };
                                croJsonArr.push(croJson);
                            }
                            logger.info("croJsonArr:", croJsonArr, "type:", typeof (croJsonArr), "getMark:", ++getMark);
                            // 查询商品及商户信息结束

                            // 以下为计算子供货数据
                            logger.info("getMark:", getMark);
                            if (getMark == 2) {
                                var subStockAmountInfo = []; //所有提交的商品的临时信息（json）数组
                                var insertstockIDArr = [];
                                var getinsertstockIDArrmark = 0;
                                function fn() {
                                    return new Promise(resolve => {
                                        for (var i = 0; i < proJsonArr.length; i++) { //遍历数据库中提取的商品编号信息
                                            var subStockPrice = 0; //某种提交的商品的总额
                                            var subStockNum = 0; //某种提交的商品的总数量
                                            for (var j = 0; j < proData.length; j++) { //遍历提交的商品编号
                                                if (proJsonArr[i].proID == proData[j]) { //取json中的值,若数据库中提取的proJsonArr商品编号=某种提交的proData商品id
                                                    var proPrice_temp = proJsonArr[i].proPrice * proDataNum[j];
                                                    subStockPrice += proPrice_temp;
                                                    subStockNum += proDataNum[j];
                                                    logger.info("商品:", proJsonArr[i].proID, "的当前总额:", proPrice_temp);
                                                }
                                            }
                                            var subStock = new Object();
                                            subStock.proID = proJsonArr[i].proID;
                                            subStock.proPrice = proJsonArr[i].proPrice;
                                            subStock.num = subStockNum * stuData.length; //乘以学生数量
                                            subStock.amount = subStockPrice * stuData.length; //乘以学生数量
                                            subStock.croID = proJsonArr[i].croID;
                                            // logger.info("商品", proJsonArr[i].proID, "的总额(子采购总额):", subStockPrice);
                                            logger.info("子采购信息（商品编号，商品单价，商品数量，子采购总额）", subStock);
                                            subStockAmountInfo.push(subStock);
                                        }
                                        stockSucc = true;
                                        logger.info("当前所有提交的商品（子采购信息）的临时信息：", subStockAmountInfo);

                                        // 以下为计算供货数据 为每个采购商户计算供货信息、计算总额、插入供货信息
                                        var getMark2 = 0;
                                        for (var ii = 0; ii < croJsonArr.length; ii++) {
                                            (function (ii) { //闭包,等同于使用变量k。
                                                // 以下为查询最后一个进货编号和清算号
                                                connection.query($sql.TinsertStockInfo_queryLastStockID, function (err, result) {
                                                    getinsertstockIDArrmark++;
                                                    if (err) { //查询最后一个进货编号和清算号错误
                                                        logger.info("查询最后一个进货编号和清算号错误。错误编号：00241");
                                                        var message = "抱歉，查询最后一个进货编号和清算号错误。错误编号：00241，返回缴费订单管理页";
                                                        var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                                        res.send(re);
                                                        connection.release();
                                                    } else { //查询最后一个进货编号和清算号成功
                                                        // 计算将要新插入的清算号数组
                                                        logger.info("最后一个清算号:", result[1][0].清算号,"type:",typeof(result[1][0].清算号));
                                                        logger.info("最后一个进货编号:", result[0][0].采购编号);
                                                        var insertclearID = "";
                                                        var queryLastClearID = result[1][0].清算号;
                                                        var numClear = queryLastClearID.substring(1);
                                                        numClear = parseInt(numClear);
                                                        numClear += ii + 1;
                                                        if (String(numClear).length < 6) {
                                                            numClear = (Array(6).join(0) + numClear).slice(-6);
                                                        }
                                                        insertclearID += "Q" + numClear;

                                                        // 计算将要新插入的进货编号数组
                                                        var insertstockID = "";
                                                        var queryLastStockID = result[0][0].采购编号;
                                                        var num = queryLastStockID.substring(1);
                                                        num = parseInt(num);
                                                        num += ii + 1;
                                                        if (String(num).length < 6) {
                                                            num = (Array(6).join(0) + num).slice(-6);
                                                        }
                                                        insertstockID += "C" + num;
                                                        insertstockIDArr.push(insertstockID);
                                                        logger.info("insertstockIDArr:", insertstockIDArr);

                                                        // 计算某商户的供货总金额
                                                        var moneyAmount = 0;
                                                        for (var j = 0; j < subStockAmountInfo.length; j++) {
                                                            // logger.info("subStockAmountInfo[j].croID:", subStockAmountInfo[j].croID);
                                                            if (subStockAmountInfo[j].croID == croJsonArr[ii].croID) {
                                                                moneyAmount += subStockAmountInfo[j].amount;
                                                                logger.info("moneyAmount:", moneyAmount);
                                                            }
                                                        }
                                                        // 以下为 将某商户的供货信息、清算信息插入数据库
                                                        var insertStockInfoArr = [];
                                                        insertStockInfoArr.push(insertstockID);
                                                        insertStockInfoArr.push(moneyAmount);
                                                        insertStockInfoArr.push(croJsonArr[ii].croID);
                                                        insertStockInfoArr.push(croJsonArr[ii].croName);
                                                        insertStockInfoArr.push(croJsonArr[ii].gropID);

                                                        insertStockInfoArr.push(insertclearID);
                                                        insertStockInfoArr.push(insertstockID);
                                                        insertStockInfoArr.push(moneyAmount);
                                                        insertStockInfoArr.push(0);
                                                        insertStockInfoArr.push(0);
                                                        // var sub_k = k++;
                                                        logger.info("insertStockInfoArr,ii:", insertStockInfoArr, ii);
                                                        connection.query($sql.TinsertStockInfo_insertStockInfo, insertStockInfoArr, function (err, result) {
                                                            if (err) { //插入供货信息错误
                                                                logger.info("插入供货信息错误。错误编号：00242");
                                                                var message = "抱歉，插入供货信息错误。错误编号：00242，返回缴费订单管理页";
                                                                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                                                res.send(re);
                                                                connection.release();
                                                            } else {
                                                                getMark2++;
                                                                logger.info("插入供货信息成功，供货信息id:", insertstockID, "getMark2:", getMark2, "croJsonArr.length:", croJsonArr.length);
                                                            }
                                                        });
                                                    }
                                                    logger.info("当前insertstockIDArr[]:",insertstockIDArr);
                                                    logger.info("getinsertstockIDArrmark:",getinsertstockIDArrmark,"croJsonArr.length:",croJsonArr.length);
                                                    logger.info("if(getinsertstockIDArrmark == croJsonArr.length)?:",getinsertstockIDArrmark == croJsonArr.length);
                                                    if(getinsertstockIDArrmark == croJsonArr.length){
                                                        resolve();
                                                    }
                                                });
                                                // logger.info("ii:",ii,"croJsonArr.length-1:",croJsonArr.length-1);
                                                // if(ii == croJsonArr.length-1){
                                                //     resolve();
                                                // }
                                            })(ii);
                                            
                                        }
                                        // logger.info("insertstockIDArr.length,croJsonArr.length-1:",insertstockIDArr.length,croJsonArr.length-1)
                                        // if(insertstockIDArr.length == croJsonArr.length-1){
                                        // }
                                    })
                                }
                                async function f1() {
                                    await fn();
                                    // if(getinsertstockIDArrmark == true){

                                    logger.info("insertstockIDArr:", insertstockIDArr);
                                    // 以下为 将某商户的子供货信息插入数据库
                                    // 产生子供货信息编号
                                    logger.info("childStockIDByStock:", childStockIDByStock);
                                    // var sub_k = 0;
                                    for (var n = 0; n < croJsonArr.length; n++) {
                                        var childStockIDByStock = 0; //某商户的子供货信息序号
                                        (function (m) { //闭包,等同于使用变量k。
                                            for (var m = 0; m < subStockAmountInfo.length; m++) {
                                                (function (m) { //闭包,等同于使用变量k。
                                                    var insertChildStockInfoArr = [];
                                                    logger.info("m:",m,"subStockAmountInfo[m].croID:", subStockAmountInfo[m].croID,"croJsonArr[m]:",croJsonArr[m]);
                                                    if (subStockAmountInfo[m].croID == croJsonArr[n].croID) {
                                                        var childStockID = "";
                                                        childStockID = insertstockIDArr[n] + obj.PrefixInteger(childStockIDByStock + 1, 4);
                                                        logger.info("childStockIDByStock:", childStockIDByStock++, "childStockID:", childStockID);
                                                        insertChildStockInfoArr.push(childStockID);
                                                        insertChildStockInfoArr.push(insertstockIDArr[n]);
                                                        insertChildStockInfoArr.push(subStockAmountInfo[m].proID);
                                                        insertChildStockInfoArr.push(subStockAmountInfo[m].proPrice);
                                                        insertChildStockInfoArr.push(subStockAmountInfo[m].num);
                                                        insertChildStockInfoArr.push(subStockAmountInfo[m].amount);
                                                        logger.info("insertChildStockInfoArr:", insertChildStockInfoArr, "m:", m);
                                                        connection.query($sql.TinsertStockInfo_insertSubStockInfo, insertChildStockInfoArr, function (err, result) {
                                                            if (err) { //插入子供货信息错误
                                                                logger.info("插入子供货信息错误。错误编号：00243");
                                                                var message = "抱歉，插入子供货信息错误。错误编号：00243，返回缴费订单管理页";
                                                                var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
                                                                res.send(re);
                                                                connection.release();
                                                            } else {
                                                                logger.info("插入子供货信息成功，子采购编号：", childStockID);

                                                            }
                                                        });
                                                    }
                                                })(m);
                                            }
                                        })(n);
                                    }
                                    // }
                                }
                                f1();
                                // logger.info(3);
                            }
                        }
                    });
                }
            });
            connection.release();
            logger.info("插入批量订单、供货信息、清算信息成功");
            var message = "插入批量订单、供货信息、清算信息成功,返回缴费订单管理页";
            var re = `<script>alert('${message}'); location.href="/TallOrdersAdmin"</script>`;
            res.send(re);
        });
    },

    // TclearInfoAdmin 修改清算信息
    updateClearInfo: function(res,req){
        var teacherName = req.session.username;
        logger.info(teacherName + "进入TcreatOrdersInBatches_CreatOrders函数");
        var update_clearId = req.body.update_clearId;
        var update_stockId = req.body.update_stockId;
        var update_deposit = req.body.update_deposit.slice(1.-1);
        update_deposit = parseFloat(update_deposit);
        if(req.body.update_depositStatus == "未支付"){
            var update_depositStatus =0;
        }else{
            var update_depositStatus =1;
        }
        var update_remainingPayment = req.body.update_remainingPayment.slice(1.-1);
        update_remainingPayment = parseFloat(update_remainingPayment);
        if(req.body.update_remainingPaymentStatus == "未结算"){
            var update_remainingPaymentStatus =0;
        }else{
            var update_remainingPaymentStatus =1;
        }
        var update_depositPayTime = req.body.update_depositPayTime;
        var update_remainingPayLimit = req.body.update_remainingPayLimit;
        var update_dataArr = [update_deposit,update_depositStatus,update_remainingPayment,update_remainingPaymentStatus,update_depositPayTime,update_remainingPayLimit,update_clearId];
        var sql = "update 清算表 set 定金金额=?,定金状态=?,尾款=?,尾款状态=?,定金支付时间=?,尾款支付期限=? where 清算号=?";
        if(update_depositPayTime == ''){
            if(update_remainingPayLimit == ''){//两个时间都为空
                update_dataArr = [update_deposit,update_depositStatus,update_remainingPayment,update_remainingPaymentStatus,update_clearId];
                sql = "update 清算表 set 定金金额=?,定金状态=?,尾款=?,尾款状态=? where 清算号=?";
            }else{//定金支付时间为空
                update_dataArr = [update_deposit,update_depositStatus,update_remainingPayment,update_remainingPaymentStatus,update_remainingPayLimit,update_clearId];
                sql = "update 清算表 set 定金金额=?,定金状态=?,尾款=?,尾款状态=?,尾款支付期限=? where 清算号=?"
            }
        }else if(update_remainingPayLimit == ''){//尾款支付期限为空
            update_dataArr = [update_deposit,update_depositStatus,update_remainingPayment,update_remainingPaymentStatus,update_depositPayTime,update_clearId];
            sql = "update 清算表 set 定金金额=?,定金状态=?,尾款=?,尾款状态=?,定金支付时间=? where 清算号=?";
        }else{//两个时间都不为空
        }
        logger.info("待更新清算信息update_dataArr:",update_dataArr);
        logger.info("待更新清算信息sql:",sql);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                logger.info("数据库连接池错误。错误编号：00244");
                var message = "抱歉，发生了错误，请联系系统管理员。错误编号：00244，返回清算统计页";
                var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                res.send(re);
            }
            connection.query(sql, update_dataArr, function (err, result) {
                if (err) { //更改清算信息错误
                    logger.info("更改清算信息错误。错误编号：00245",err);
                    var message = "抱歉，更改清算信息错误。错误编号：00245，返回清算统计页";
                    var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                    res.send(re);
                    connection.release();
                } else { //更改清算信息错误成功
                    connection.release();
                    logger.info("更改清算信息成功");
                    var message = "更改清算信息成功";
                    var re = `<script>alert('${message}'); location.href="/TclearInfoAdmin"</script>`;
                    res.send(re);
                }
            });

        });
    },

};
module.exports = obj;