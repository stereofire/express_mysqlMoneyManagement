// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    // 个人信息
    check: 'select * from 用户信息表 where 学号=?',
    // 更新密码
    changePssword: 'update 用户信息表 set 密码=? where 学号=?',
    // 待缴订单总额//`订单支付状态` =3 or `订单支付状态` =2
    TotalAmount: 'SELECT SUM(`交易金额`) AS totalAmount FROM `订单信息表` WHERE `学号`=? AND (`订单支付状态` = 3 or `订单支付状态` = 2) union all SELECT SUM(`交易金额`) AS totalRequireAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态` = 3 union all SELECT SUM(`交易金额`) AS totalOptionAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态` = 2 ',
    // 待缴 必缴订单总额//`订单支付状态` =3
    RequireAmount: 'SELECT SUM(`交易金额`) AS requireAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态` = 3',
    // 待缴 必缴订单详细信息//`订单支付状态` =3
    RequireOrders: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`学号` = ? AND `订单信息表`.`订单支付状态` = 3 GROUP BY `子订单信息表`.`子订单编号`, `子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`子订单信息表`. `商品数量`, `子订单信息表`.`商品单价`, `子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`, `订单信息表`.`学号` ORDER BY `子订单信息表`.`子订单编号` DESC;',
    // 所有订单记录
    OrderRecord: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态`,`订单信息表`.`创建时间`,`订单信息表`.`支付时间`,`订单信息表`.`支付期限`,`订单信息表`.`支付失败原因` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`学号` = ? GROUP BY `子订单信息表`.`子订单编号`, `子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`子订单信息表`. `商品数量`, `子订单信息表`.`商品单价`, `子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`, `订单信息表`.`学号` ORDER BY `订单信息表`.`订单支付状态` DESC,`子订单信息表`.`子订单编号` DESC;',
    // 可选缴商品详细信息//`商品状态` = 1 
    OptionalOrder:"SELECT `商品清单`.`商品编号`, `商品清单`.`商品名称`, `商品清单`.`商品单价`, `商户信息表`.`商户名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码` WHERE `商品清单`.`商品状态` = 1  AND `商品清单`.`商品编号`<>'S000090' AND `商品清单`.`商品编号`<>'S000098' ORDER BY `商品清单`.`商品编号` ASC", 
    // 待缴 选缴订单商品总额//`订单支付状态` =2
    OptionalAmount: 'SELECT SUM(`交易金额`) AS optionalAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态` = 2',

    // 支付方式页 订单总额 倒计时
    AmountAndResttime:'SELECT `订单信息表`.`交易单号`, `订单信息表`.`交易金额`, `订单信息表`.`创建时间`, `订单信息表`.`支付期限`, TimeStampDiff(SECOND,now(), `订单信息表`.`支付期限`) AS 剩余时间 FROM`订单信息表`WHERE`订单信息表`.`学号` = ? AND`订单信息表`.`订单编号` = ? ',
    
    // 提交订单——订单信息表插入
    InsertOrder:"INSERT INTO `订单信息表`(`交易单号`, `创建时间`, `学号`, `支付期限`,`订单支付状态`) VALUES(?,?,?,?,'2');",
    // 提交订单——子订单信息插入
    // 商品单价&商户代码查询
    QueryCmmodit:"SELECT `商品清单`.`商品单价`,`商品清单`.`商户代码` FROM `商品清单` WHERE `商品清单`.`商品编号` = ?",
    // 插入子订单信息
    InsertChildOrder:"INSERT INTO `子订单信息表`(`子订单编号`,`订单编号`,`商品编号`,`商品数量`,`商品单价`,`子订单总额`,`商户代码`) VALUES(?,?,?,?,?,?,?)",
    // sum查询订单信息的订单总额
    SumOrderAmount:"SELECT Sum(`子订单信息表`.`子订单总额`) AS `订单总额` FROM`子订单信息表` WHERE `子订单信息表`.`订单编号` = ?",
    // 更新订单信息的订单总额
    UpdateOrderAmount:"UPDATE `订单信息表` SET `交易金额`=? WHERE `订单编号`=?",

    // 奖学金发放信息页
    QueryScholarship:"SELECT * FROM `奖学金信息表` WHERE `奖学金信息表`.`学号` = ? ORDER BY `奖学金信息表`.`发放编号` ASC",

    // 删除选缴订单
    deleteOrder:"DELETE FROM `订单信息表` WHERE `订单编号` = ?; DELETE FROM `子订单信息表` WHERE `订单编号` = ?;",
    
    
    
    insert: 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
    update: 'update user set name=?, age=? where id=?',
    delete: 'delete from user where id=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
};

module.exports = user;