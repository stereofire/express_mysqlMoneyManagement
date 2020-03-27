// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
var ejs = require('ejs');
var fs = require('fs');
moment = require('moment');
var ejsExcel = require("ejsExcel");
// var exceltt = require("./exceltt.js");
const path = require('path');
// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

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

const obj = {
    // check_login: function (account, password, callback) {
    // 登录验证
    check_login: function (account, password, req, res) {
        // console.log(account, password);
        pool.getConnection(function (err, connection) {
            // console.log(account, password);
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                // callback(0);
                res.send();
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误
                    console.log("用户账户查询错误，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    // callback(1);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    console.log("用户不存在，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
                    var college = new String(result[0].学校);
                    var studentName = new String(result[0].姓名);
                    var school = new String(result[0].院系);
                    var major = new String(result[0].专业);
                    var gender = new String(result[0].性别);
                    var grade = new String(result[0].年级);
                    var readStatus = new String(result[0].在读状态);
                    var rightPassword = new String(result[0].密码);
                    console.log(readStatus);
                    if (readStatus == '1') {
                        readStatus = "在读";
                    } else {
                        readStatus = "不在读";
                    }
                    console.log(readStatus);
                    console.log("正确密码应为：", rightPassword);
                    if (rightPassword == password) { //密码正确
                        console.log('密码正确,登录成功');
                        // 将登录的用户保存到session中
                        req.session.user = account;
                        // 设置是否登录为true
                        req.session.islogin = true;
                        // 设置已登录用户的欢迎名
                        req.session.username = studentName;
                        // 开启event_scheduler
                        connection.query($sql.setEventScheduler, account, function (err, result) {
                            if (err) { //开启event_scheduler错误
                                console.log("开启event_scheduler错误。");
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
                                console.log(err);
                            }
                            res.end(data);
                        })
                        // callback(2);
                        connection.release();
                    } else { //密码错误
                        console.log("密码错误，请重新登陆！");
                        console.log(3);
                        ejs.renderFile('views/index.ejs', {}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            res.end(data);
                        })
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
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.changePssword, [new_password, account], function (err, result) {
                if (err) {
                    console.log('密码修改出错，请重新密码更新操作');
                    ejs.renderFile('views/changePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //密码修改成功,重新登录
                    // console.log(result[0]);//密码修改成功后不会有反馈，result=undefined
                    console.log("密码修改成功,请重新登录");
                    connection.release();
                    ejs.renderFile('views/changePasswordOK.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
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
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误,重新密码更新
                    console.log("用户账户查询错误，请重新密码更新操作");
                    ejs.renderFile('views/changePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在,重新密码更新
                    console.log("用户不存在，请重新密码更新操作");
                    ejs.renderFile('views/changePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
                    var rightPassword = new String(result[0].密码);
                    console.log("正确密码应为：", rightPassword);
                    if (rightPassword == old_password) { //密码正确,可以进行密码修改操作
                        console.log('密码正确,可以进行密码修改操作');
                        connection.release();
                        obj.updatePassword(account, new_password, res);
                        console.log('调用了userDao.updatePassword');
                    } else { //密码错误，驳回修改密码请求
                        console.log("密码错误，驳回修改密码请求！");
                        console.log(3);
                        ejs.renderFile('views/changePassword.ejs', {}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            res.end(data);
                        })
                        connection.release();
                    }
                }
            });
        });
    },

    // home页信息
    queryInformation: function (account, res) {
        console.log(account + "进入queryInformation函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.check, account, function (err, result) {
                if (err) { //用户账户查询错误
                    console.log("用户账户查询错误，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    console.log("用户不存在，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
                    var college = new String(result[0].学校);
                    var studentName = new String(result[0].姓名);
                    var school = new String(result[0].院系);
                    var major = new String(result[0].专业);
                    var gender = new String(result[0].性别);
                    var grade = new String(result[0].年级);
                    var readStatus = new String(result[0].在读状态);
                    var rightPassword = new String(result[0].密码);
                    console.log(readStatus);
                    if (readStatus == '1') {
                        readStatus = "在读";
                    } else {
                        readStatus = "不在读";
                    }
                    console.log(readStatus);
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
                            console.log(err);
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
        console.log(account + "进入queryTotalAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            var arrAccount = [account, account, account];
            connection.query($sql.TotalAmount, arrAccount, function (err, result) {
                if (err) { //用户账户查询错误
                    console.log(err);
                    console.log("用户账户查询错误，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    console.log("用户不存在，请重新登录");
                    ejs.renderFile('views/index.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    // console.log(result[0]);
                    // var totalAmount = new String(result[0].totalAmount);
                    // var totalAmount = 2000;
                    console.log(result);
                    var totalAmount = result;
                    console.log(totalAmount[0].totalAmount);
                    console.log(totalAmount[1].totalAmount);
                    console.log(totalAmount[2].totalAmount);
                    if (totalAmount[0].totalAmount == null) {
                        totalAmount[0].totalAmount = 0;
                        console.log(totalAmount[0].totalAmount);
                    }
                    if (totalAmount[1].totalAmount == null) {
                        totalAmount[1].totalAmount = 0;
                        console.log(totalAmount[1].totalAmount);
                    }
                    if (totalAmount[2].totalAmount == null) {
                        totalAmount[2].totalAmount = 0;
                        console.log(totalAmount[2].totalAmount);
                    }
                    var studentName = req.session.username;
                    ejs.renderFile('views/paymentOrder.ejs', {
                        totalAmount,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryRequireAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.RequireAmount, account, function (err, result) {
                if (err) {
                    console.log("必缴账单查询错误，返回缴费订单总页");
                    connection.release();
                    queryTotalAmount(account, res);
                } else if (result[0] == undefined) { //无必缴账单总额,返回必缴账单总额为0、必缴订单
                    console.log("无必缴账单总额,返回必缴账单总额为0、必缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: 0,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                } else { //有必缴账单总额
                    console.log(result[0]);
                    var requireAmount = new String(result[0].requireAmount);
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: requireAmount,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    queryRequireOrders: function (account, res, req) {
        console.log(account + "进入queryRequireOrders函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.RequireOrders, account, function (err, result) {
                if (err) { //必缴账单查询错误
                    console.log("必缴账单查询错误，返回缴费订单总页");
                    obj.queryTotalAmount(account, res, req);
                } else if (result[0] == undefined) { //无必缴账单
                    console.log("无必缴账单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/requiredOrder.ejs', {
                        requireAmount: 0,
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有必缴账单
                    console.log(result);
                    obj.queryRequireAmount(account, result, res, req);
                    connection.release();
                }
            });
        });
    },

    //optionalOrder 选缴订单页信息(两个函数)
    queryOptionalAmount: function (account, Result, res, req) {
        console.log(account + "进入queryOptionalAmount函数");
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.OptionalAmount, account, function (err, result) {
                if (err) {
                    console.log("选缴账单查询错误，返回缴费订单总页");
                    connection.release();
                    queryTotalAmount(account, res, req);
                } else if (result[0].optionalAmount == null) { //无选缴账单总额,返回选缴账单总额为0、选缴订单
                    console.log("无选缴账单总额,返回选缴账单总额为0、选缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        optionalAmount: 0,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                } else { //有选缴账单总额
                    console.log("选缴账单总额:", result[0].optionalAmount);
                    var optionalAmount = new String(result[0].optionalAmount);
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        optionalAmount: optionalAmount,
                        result: Result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    queryOptionalOrder: function (account, res, req) {
        console.log(account + "进入queryOptionalOrder函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.OptionalOrder, account, function (err, result) {
                if (err) { //选缴订单查询错误
                    console.log("选缴订单查询错误，返回缴费订单总页");
                    connection.release();
                    queryTotalAmount(account, res, req);
                } else if (result[0] == undefined) { //无可选缴订单
                    console.log("无可选缴订单");
                    var studentName = req.session.username;
                    ejs.renderFile('views/optionalOrder.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有选缴订单
                    console.log(result);
                    obj.queryOptionalAmount(account, result, res, req);
                    connection.release();
                }
            });
        });
    },

    //orderRecord订单记录页信息
    queryOrderRecord: function (account, res, req) {
        console.log(account + "进入queryOrderRecord函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.OrderRecord, account, function (err, result) {
                if (err) { //订单记录查询错误
                    console.log("订单记录查询错误，返回缴费订单总页");
                    connection.release();
                    queryTotalAmount(account, res, req);
                } else if (result[0] == undefined) { //无订单记录
                    console.log("无订单记录");
                    var studentName = req.session.username;
                    ejs.renderFile('views/orderRecord.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有订单记录
                    console.log(result);
                    var studentName = req.session.username;
                    ejs.renderFile('views/orderRecord.ejs', {
                        result: result,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryPayMethod函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            var orderNo = data.OrderNo;
            var Text = data.text;
            connection.query($sql.AmountAndResttime, [account, orderNo], function (err, result) {
                if (err) { //订单支付查询错误
                    console.log(err);
                    console.log("订单支付查询错误，返回订单记录页");
                    connection.release();
                    obj.queryOrderRecord(account, res, req);
                } else if (result[0] == undefined) { //订单支付不存在
                    console.log("订单支付不存在，返回订单记录页");
                    connection.release();
                    obj.queryOrderRecord(account, res, req);
                } else { //订单支付存在
                    console.log(result);
                    var Data = {
                        Text: Text,
                        OrderNo: orderNo,
                        OrderAccount: result[0].交易单号,
                        OrderAmount: result[0].交易金额,
                        OrderCreatTime: result[0].创建时间,
                        OrderLimitTime: result[0].支付期限,
                        CountDoun: result[0].剩余时间
                    }
                    // console.log(req.session.username);
                    var studentName = req.session.username;
                    ejs.renderFile('./views/paymentMethod.ejs', {
                        Data,
                        studentName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入querySubmitOrder函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            console.log(data); // { S000002: '1', S000001: '1' }
            var studentName = req.session.username;


            // 插入订单信息
            console.log((new Date()).getTime()); // js13位时间戳
            console.log(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')); // mysql的datetime时间类型
            var creattime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var payLimitTime = moment(new Date()).add(2, 'days').format('YYYY-MM-DD HH:mm:ss');;

            var orderid = obj.createRandomId(); // 生成唯一订单号：YYYY-MM-DD+js13位时间戳+7位随机数字
            // res.send(orderid);
            connection.query($sql.InsertOrder, [orderid, creattime, account, payLimitTime], function (err, result) {
                if (err) { //订单信息表插入错误
                    console.log(err);
                    console.log("订单信息表插入错误，返回订单记录页");
                    connection.release();
                    obj.queryOrderRecord(account, res, req);
                } else { //订单信息表插入成功
                    console.log(result.insertId);
                    var insertOrderId = result.insertId;
                    // 引用查询商品单价和供应商代码的函数
                    // obj.queryCmmodit(account, insertOrderId, data, res, req);

                    // 循环查询所有商品单价和供应商代码，并插入子订单信息表
                    var goodsList = Object.keys(data);
                    console.log(goodsList);
                    var k = 0;
                    for (var i = 0; i < goodsList.length; i++) {
                        connection.query($sql.QueryCmmodit, goodsList[i], function (err, result) {
                            if (err) { //查询商品单价和供应商代码错误
                                console.log(err);
                                console.log("查询商品单价和供应商代码错误，返回订单记录页");
                                connection.release();
                                obj.queryOrderRecord(account, res, req);
                            } else {
                                // console.log(result);
                                var Result = JSON.parse(JSON.stringify(result));
                                // console.log(Result);
                                var price = Result[0].商品单价;
                                var MerchantID = Result[0].商户代码;
                                // console.log(price,MerchantID);

                                // 产生子订单编号
                                var childOrderID = "";
                                childOrderID = insertOrderId + obj.PrefixInteger(k + 1, 2);
                                console.log("childOrderID:", childOrderID);

                                // 订单编号：insertOrderId
                                // 商品编号：goodsList[i]
                                // 数量：data.goodsList[i]
                                // 单价：price
                                // 子订单总额：data.goodsList[i]*price
                                // 商户代码：MerchantID
                                // console.log(insertOrderId,goodsList[k],data[goodsList[k]],price,data[goodsList[k++]]*price,MerchantID);

                                var arrChildOrder = [childOrderID, insertOrderId, goodsList[k], parseInt(data[goodsList[k]]), price, data[goodsList[k++]] * price, MerchantID];
                                console.log(arrChildOrder);
                                connection.query($sql.InsertChildOrder, arrChildOrder, function (err, result) {
                                    if (err) { //插入子订单错误
                                        console.log(err);
                                        console.log("插入子订单错误，返回订单记录页");
                                        connection.release();
                                        obj.queryOrderRecord(account, res, req);
                                    } else { // SUM查询需要插入订单信息表的订单总额
                                        connection.query($sql.SumOrderAmount, insertOrderId, function (err, result) {
                                            if (err) { //SUM查询订单总额错误
                                                console.log(err);
                                                console.log("SUM查询订单总额错误，返回订单记录页");
                                                connection.release();
                                                obj.queryOrderRecord(account, res, req);
                                            } else { //SUM查询订单总额成功
                                                console.log(insertOrderId, result[0].订单总额);
                                                var amount = result[0].订单总额;
                                                connection.query($sql.UpdateOrderAmount, [amount, insertOrderId], function (err, result) {
                                                    if (err) { //更新订单总额错误
                                                        console.log(err);
                                                        console.log("更新订单总额错误，返回订单记录页");
                                                        connection.release();
                                                        obj.queryOrderRecord(account, res, req);
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
                            console.log(err);
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

    // 奖学金发放信息页
    queryScholarshipRecord: function (account, res, req) {
        console.log(account + "进入queryScholarshipRecord函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.QueryScholarship, account, function (err, result) {
                if (err) { //奖学金信息查询错误
                    console.log("奖学金信息查询错误，返回缴费订单总页");
                    obj.queryTotalAmount(account, res, req);
                } else if (result[0] == undefined) { //无奖学金信息
                    console.log("无奖学金信息，返回订单记录页");
                    connection.release();
                    queryOrderRecord(account, res, req);
                } else { //有奖学金信息
                    console.log(result);
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
                            console.log(err);
                        }
                        res.end(data);
                    })
                }
            });
        });
    },

    //orderRecord订单记录页删除选缴订单
    deleteOrderRecord: function (account, res, req) {
        console.log(account + "进入deleteOrderRecord函数");
        var orderID = req.query.deleteOrder;
        console.log(orderID);
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.deleteOrder, [orderID, orderID], function (err, result) {
                if (err) { //删除选缴订单错误
                    console.log("删除选缴订单错误，返回订单记录页");
                    connection.release();
                    obj.queryOrderRecord(account, res, req);
                } else { //删除选缴订单成功
                    console.log("选缴订单删除结果：", result, "加载订单记录页");
                    connection.release();
                    obj.queryOrderRecord(account, res, req);
                }
            });
        });
    },

    // 教师登录
    teacher_check_login: function (account, password, req, res) {
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.Tcheck, account, function (err, result) {
                if (err) { //用户账户查询错误
                    console.log("用户账户查询错误，请重新登录");
                    ejs.renderFile('views/Tindex.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    // callback(1);
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    console.log("用户不存在，请重新登录");
                    ejs.renderFile('views/Tindex.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
                    var college = new String(result[0].学校);
                    var teacherName = new String(result[0].姓名);
                    var job = new String(result[0].职务);
                    var rightPassword = new String(result[0].密码);
                    console.log("正确密码应为：", rightPassword);
                    if (rightPassword == password) { //密码正确
                        console.log('密码正确,登录成功');
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
                                console.log(err);
                            }
                            res.end(data);
                        })
                        connection.release();
                    } else { //密码错误
                        console.log("密码错误，请重新登陆！");
                        console.log(3);
                        ejs.renderFile('views/Tindex.ejs', {}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            res.end(data);
                        })
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
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TchangePssword, [new_password, account], function (err, result) {
                if (err) {
                    console.log('密码修改出错，请重新密码更新操作');
                    ejs.renderFile('views/TchangePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //密码修改成功,重新登录
                    // console.log(result[0]);//密码修改成功后不会有反馈，result=undefined
                    console.log("密码修改成功,请重新登录");
                    connection.release();
                    ejs.renderFile('views/TchangePasswordOK.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                }
            });
        });
    },
    // 密码修改验证，引用updatePassword
    teacher_change_Password: function (account, old_password, new_password, res) {
        console.log(account + "进入teacher_change_Password函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.Tcheck, account, function (err, result) {
                console.log(result);
                if (err) { //用户账户查询错误,重新密码更新
                    console.log("用户账户查询错误，请重新密码更新操作");
                    ejs.renderFile('views/TchangePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在,重新密码更新
                    console.log("用户不存在，请重新密码更新操作");
                    ejs.renderFile('views/TchangePassword.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
                    var rightPassword = new String(result[0].密码);
                    console.log("正确密码应为：", rightPassword);
                    if (rightPassword == old_password) { //密码正确,可以进行密码修改操作
                        console.log('密码正确,可以进行密码修改操作');
                        connection.release();
                        obj.teacher_updatePassword(account, new_password, res);
                        console.log('调用了userDao.teacher_updatePassword');
                    } else { //密码错误，驳回修改密码请求
                        console.log("密码错误，驳回修改密码请求！");
                        console.log(3);
                        ejs.renderFile('views/TchangePassword.ejs', {}, function (err, data) {
                            if (err) {
                                console.log(err);
                            }
                            res.end(data);
                        })
                        connection.release();
                    }
                }
            });
        });
    },

    // Thome页信息 queryTInformation
    queryTInformation: function (account, res) {
        console.log(account + "进入queryTInformation函数");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.Tcheck, account, function (err, result) {
                if (err) { //用户账户查询错误
                    console.log("用户账户查询错误，请重新登录");
                    ejs.renderFile('views/Tindex.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else if (result[0] == undefined) { //用户不存在
                    console.log("用户不存在，请重新登录");
                    ejs.renderFile('views/Tindex.ejs', {}, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //用户存在
                    console.log(result[0]);
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
                            console.log(err);
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
        console.log(account + "进入downTstudentInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TstudentInfo, account, function (err, result) {
                if (err) { //学生信息查询错误
                    console.log("学生信息查询错误，返回Thome页");
                    connection.release();
                    obj.queryTInformation(account, res);
                } else { //有学生信息
                    // console.log(result);
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
        console.log(account + "进入downTgroupInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TgroupInfo, account, function (err, result) {
                if (err) { //商户集团信息查询错误
                    console.log("商户集团信息查询错误，返回Thome页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入ddownTorderInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TorderInfo, account, function (err, result) {
                if (err) { //订单信息查询错误
                    console.log("订单信息查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTstockInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TstockInfo, account, function (err, result) {
                if (err) { //供货表查询错误
                    console.log("供货表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTclearInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TclearInfo, account, function (err, result) {
                if (err) { //清算表查询错误
                    console.log("清算表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTcoursePlans函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TcoursePlans, account, function (err, result) {
                if (err) { //教材计划表查询错误
                    console.log("教材计划表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTcorpInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TcorpInfo, account, function (err, result) {
                if (err) { //供应商信息表查询错误
                    console.log("供应商信息表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTsubOrderInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TsubOrderInfo, account, function (err, result) {
                if (err) { //子订单信息表查询错误
                    console.log("子订单信息表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTsubStockInfo函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TsubStockInfo, account, function (err, result) {
                if (err) { //子供货表查询错误
                    console.log("子供货表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入downTproductList函数");
        var teacherName = req.session.username;
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TproductList, account, function (err, result) {
                if (err) { //商品清单表查询错误
                    console.log("商品清单表查询错误，返回TstudentInfoAdmin页");
                    connection.release();
                    obj.queryTInformation(account, res);
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
        console.log(account + "进入queryTstudentInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TstudentInfo, account, function (err, result) {
                if (err) { //学生信息查询错误
                    console.log("学生信息查询错误，返回Thome页");
                    connection.release();
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无学生信息
                    console.log("无学生信息");
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有学生信息
                    // console.log(result);
                    ejs.renderFile('views/TstudentInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },
    //TstudentInfoAdmin 上传学生信息
    uploadUserInfo: function(file) {
        console.log(account + "进入uploadUserInfo函数");
        obj.deleteFiles("public/tables4downLoad");
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            var userInfo = xlsx.parse(file)[0].data;
            for (i = 1; i < userInfo.length; i++) {
                studentId = userInfo[i][0];
                collage = userInfo[i][1];
                studentName = userInfo[i][2];
                department = userInfo[i][3];
                major = userInfo[i][4];
                gender = userInfo[i][5];
                grade = userInfo[i][6];
                status = userInfo[i][7];
                var TstuUploadParams = [studentId, collage, studentName, department, major, gender, grade, status, password,
                    collage, studentName, department, major, gender, grade, status];
                    // , password
                connection.query($sql.TstuUpload, TstuUploadParams, function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        connection.release();
                    }else{
                        console.log('学生数据上传成功');
                        connection.release();
                    }
                })
            }
        });
        
    },
    
    // TgroupInfoAdmin 商户集团管理页信息
    queryTgroupInfo: function (account, res, req) {
        console.log(account + "进入queryTgroupInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TgroupInfo, account, function (err, result) {
                if (err) { //商户集团查询错误
                    console.log("商户集团查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无商户集团
                    console.log("无商户集团");
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有商户集团
                    console.log(result);
                    ejs.renderFile('views/TgroupInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTcorpInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TcorpInfo, function (err, result) {
                if (err) { //供应商查询错误
                    console.log("供应商查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无供应商
                    console.log("无供应商");
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有供应商
                    console.log(result);
                    ejs.renderFile('views/TcorpInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTproductList函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TproductList, function (err, result) {
                if (err) { //缴费项目查询错误
                    console.log("缴费项目查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无缴费项目
                    console.log("无缴费项目");
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费项目
                    console.log(result);
                    ejs.renderFile('views/TproductListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTallOrders函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TallOrders, function (err, result) {
                if (err) { // 缴费订单查询错误
                    console.log(" 缴费订单查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无 缴费订单
                    console.log("无缴费订单");
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费订单
                    console.log(result);
                    ejs.renderFile('views/TallOrdersAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTpaymentRecords函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TpaymentRecords, function (err, result) {
                if (err) { // 缴费记录查询错误
                    console.log(" 缴费记录查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无 缴费记录
                    console.log("无缴费记录");
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有缴费记录
                    console.log(result);
                    ejs.renderFile('views/TpaymentRecordsAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTstockList函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TstockList, function (err, result) {
                if (err) { // 供货管理查询错误
                    console.log(" 供货管理查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无供货管理
                    console.log("无供货管理");
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有供货管理
                    console.log(result);
                    ejs.renderFile('views/TstockListAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTcoursePlans函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TcoursePlans, function (err, result) {
                if (err) { // 教材计划查询错误
                    console.log(" 教材计划查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无教材计划
                    console.log("无教材计划");
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有教材计划
                    console.log(result);
                    ejs.renderFile('views/TcoursePlansAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTclearInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TclearInfo, function (err, result) {
                if (err) { // 清算统计查询错误
                    console.log(" 清算统计查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无清算统计
                    console.log("无清算统计");
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有清算统计
                    console.log(result);
                    ejs.renderFile('views/TclearInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
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
        console.log(account + "进入queryTscholarshipInfo函数");
        var teacherName = req.session.username;
        pool.getConnection(function (err, connection) {
            if (err) { //数据库连接池错误
                console.log("数据库连接池错误");
                res.send();
            }
            connection.query($sql.TscholarshipInfo, function (err, result) {
                if (err) { // 资金发放查询错误
                    console.log(" 资金发放查询错误，返回Thome页");
                    connection.release(account, res);
                    obj.queryTInformation(account, res);
                } else if (result[0] == undefined) { //无资金发放
                    console.log("无资金发放");
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                } else { //有资金发放
                    console.log(result);
                    ejs.renderFile('views/TscholarshipInfoAdmin.ejs', {
                        result: result,
                        teacherName
                    }, function (err, data) {
                        if (err) {
                            console.log(err);
                        }
                        res.end(data);
                    })
                    connection.release();
                }
            });
        });
    },






































    add: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            // 获取前台页面传过来的参数
            var param = req.query || req.params;
            // 建立连接，向表中插入值
            // 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
            connection.query($sql.insert, [param.name, param.age], function (err, result) {
                if (result) {
                    result = {
                        code: 200,
                        msg: '增加成功'
                    };
                }
                // 以json形式，把操作结果返回给前台页面
                jsonWrite(res, result);
                // 释放连接 
                connection.release();
            });
        });
    },
    delete: function (req, res, next) {
        // delete by Id
        pool.getConnection(function (err, connection) {
            var id = +req.query.id;
            connection.query($sql.delete, id, function (err, result) {
                if (result.affectedRows > 0) {
                    result = {
                        code: 200,
                        msg: '删除成功'
                    };
                } else {
                    result = void 0;
                }
                jsonWrite(res, result);
                connection.release();
            });
        });
    },
    update: function (req, res, next) {
        // update by id
        // 为了简单，要求同时传name和age两个参数
        var param = req.body;
        if (param.name == null || param.age == null || param.id == null) {
            jsonWrite(res, undefined);
            return;
        }
        pool.getConnection(function (err, connection) {
            connection.query($sql.update, [param.name, param.age, +param.id], function (err, result) {
                // 使用页面进行跳转提示
                if (result.affectedRows > 0) {
                    res.render('suc', {
                        result: result
                    }); // 第二个参数可以直接在jade中使用
                } else {
                    res.render('fail', {
                        result: result
                    });
                }
                connection.release();
            });
        });
    },
    queryById: function (req, res, next) {
        var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
        pool.getConnection(function (err, connection) {
            connection.query($sql.queryById, id, function (err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });
    },
    queryAll: function (req, res, next) {
        pool.getConnection(function (err, connection) {
            connection.query($sql.queryAll, function (err, result) {
                jsonWrite(res, result);
                connection.release();
            });
        });
    }
};
module.exports = obj;