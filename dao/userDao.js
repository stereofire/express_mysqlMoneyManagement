// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userSqlMapping');
var ejs = require('ejs');
var fs = require('fs');
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
    check_login: function (account, password, res) {//登录验证
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
                        ejs.renderFile('views/home.ejs', {
                            user: {
                                arr: {
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
    updatePassword: function (account, new_password, res) {//密码修改
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
    change_Password: function (account, old_password, new_password, res) {//密码修改验证
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