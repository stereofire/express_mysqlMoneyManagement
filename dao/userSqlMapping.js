// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    check: 'select * from 用户信息表 where 学号=?',
    changePssword: 'update 用户信息表 set 密码=? where 学号=?',
    TotalAmount: 'SELECT SUM(`交易金额`) AS totalAmount FROM `订单信息表` WHERE `学号`=?',
    RequireAmount: 'SELECT SUM(`交易金额`) AS requireAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态`=3',
    RequireOrders: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`学号` = ? AND `订单信息表`.`订单支付状态` = 3 GROUP BY `子订单信息表`.`子订单编号`, `子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`子订单信息表`. `商品数量`, `子订单信息表`.`商品单价`, `子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`, `订单信息表`.`学号` ORDER BY `子订单信息表`.`子订单编号` DESC;',
    OrderRecord: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`学号` = ? GROUP BY `子订单信息表`.`子订单编号`, `子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`子订单信息表`. `商品数量`, `子订单信息表`.`商品单价`, `子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`, `订单信息表`.`学号` ORDER BY `子订单信息表`.`子订单编号` DESC;',
    OptionalOrder:"SELECT `商品清单`.`商品编号`, `商品清单`.`商品名称`, `商品清单`.`商品单价`, `商户信息表`.`商户名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码` WHERE `商品清单`.`商品状态` = 1  AND `商品清单`.`商品编号`<>'S000090' AND `商品清单`.`商品编号`<>'S000098' ORDER BY `商品清单`.`商品编号` ASC", 
    OptionalAmount: 'SELECT SUM(`交易金额`) AS optionalAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态`=2',

    insert: 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
    update: 'update user set name=?, age=? where id=?',
    delete: 'delete from user where id=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
};

module.exports = user;