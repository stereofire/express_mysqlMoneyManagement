// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    // 开启event_scheduler
    setEventScheduler: 'set global event_scheduler =1;',
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
    OptionalOrder: "SELECT `商品清单`.`商品编号`, `商品清单`.`商品名称`, `商品清单`.`商品单价`, `商户信息表`.`商户名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码` WHERE `商品清单`.`商品状态` = 1  AND `商品清单`.`商品编号`<>'S000090' AND `商品清单`.`商品编号`<>'S000098' ORDER BY `商品清单`.`商品编号` ASC",
    // 待缴 选缴订单商品总额//`订单支付状态` =2
    OptionalAmount: 'SELECT SUM(`交易金额`) AS optionalAmount FROM `订单信息表` WHERE `学号`=? AND `订单支付状态` = 2',

    // 支付方式页 订单总额 倒计时
    AmountAndResttime: 'SELECT `订单信息表`.`交易单号`, `订单信息表`.`交易金额`, `订单信息表`.`创建时间`, `订单信息表`.`支付期限`, TimeStampDiff(SECOND,now(), `订单信息表`.`支付期限`) AS 剩余时间 FROM`订单信息表`WHERE`订单信息表`.`学号` = ? AND`订单信息表`.`订单编号` = ? ',

    // 提交订单——订单信息表插入
    InsertOrder: "INSERT INTO `订单信息表`(`交易单号`, `创建时间`, `学号`, `支付期限`,`订单支付状态`) VALUES(?,?,?,?,'2');",
    // 提交订单——子订单信息插入
    // 商品单价&商户代码查询
    QueryCmmodit: "SELECT `商品清单`.`商品单价`,`商品清单`.`商户代码` FROM `商品清单` WHERE `商品清单`.`商品编号` = ?",
    // 插入子订单信息
    InsertChildOrder: "INSERT INTO `子订单信息表`(`子订单编号`,`订单编号`,`商品编号`,`商品数量`,`商品单价`,`子订单总额`,`商户代码`) VALUES(?,?,?,?,?,?,?)",
    // sum查询订单信息的订单总额
    SumOrderAmount: "SELECT Sum(`子订单信息表`.`子订单总额`) AS `订单总额` FROM`子订单信息表` WHERE `子订单信息表`.`订单编号` = ?",
    // 更新订单信息的订单总额
    UpdateOrderAmount: "UPDATE `订单信息表` SET `交易金额`=? WHERE `订单编号`=?",

    // 更新订单支付时间
    setOrderPayTime: "UPDATE `订单信息表` SET `支付时间`=? WHERE `订单编号`=?;UPDATE `订单信息表` SET `订单支付状态`='1' WHERE `订单编号`=?;UPDATE `订单信息表` SET `支付渠道`='模拟银联支付' WHERE `订单编号`=?",
    // 查询订单信息以渲染支付结果页
    QueryOrderInfo: "SELECT 交易单号, 支付时间, 交易金额,支付失败原因 FROM 订单信息表 WHERE 订单编号=?",
    // 更新订单支付状态为支付失败（0），失败原因为余额不足
    setOrderPayStatus: "UPDATE `订单信息表` SET `订单支付状态`='0' WHERE `订单编号`=?;UPDATE `订单信息表` SET `支付失败原因`='余额不足' WHERE `订单编号`=?;UPDATE `订单信息表` SET `支付渠道`='模拟银联支付' WHERE `订单编号`=?",

    // 奖学金发放信息页
    QueryScholarship: "SELECT * FROM `奖学金信息表` WHERE `奖学金信息表`.`学号` = ? ORDER BY `奖学金信息表`.`发放编号` ASC",

    // 删除选缴订单
    deleteOrder: "DELETE FROM `订单信息表` WHERE `订单编号` = ?; DELETE FROM `子订单信息表` WHERE `订单编号` = ?;",


    // 以下为教师端sql


    // 教师个人信息
    Tcheck: 'select * from 管理员信息表 where 管理员号=?',
    // 更新教师密码
    TchangePssword: 'update 管理员信息表 set 密码=? where 管理员号=?',

    // 学生信息
    TstudentInfo: 'select * from 用户信息表 ',
    // 查询学生（该管理员）所属学校
    TaddStuInfo_queryCollege: 'select 学校 from 管理员信息表 where 管理员号 = ?',
    // 新增学生信息
    TaddStuInfo: 'INSERT INTO 用户信息表(学号,学校,姓名,院系,专业,性别,年级,在读状态) VALUES(?,?,?,?,?,?,?,?)',
    // 学生信息上传
    TstuUpload: 'INSERT INTO 用户信息表(学号,学校,姓名,院系,专业,性别,年级,在读状态) VALUES(?,?,?,?,?,?,?,?)',
    // 学生在读状态查询
    TstudentReadStatus: 'select 在读状态 from 用户信息表 where 学号=?',
    // 修改学生在读状态
    TchangeReadStatus: 'update 用户信息表 set 在读状态=? where 学号=?',

    // 订单信息表
    TorderInfo: 'select * from 订单信息表 ',
    // 子订单信息表
    TsubOrderInfo: 'select * from 子订单信息表 ',

    // 不可上传表格
    // 商户集团信息
    TgroupInfo: 'select * from 商户集团信息表',
    // 新增商户集团信息
    TaddGroupInfo: 'INSERT INTO 商户集团信息表(集团名称,备注,状态) VALUES(?,?,?)',
    // 商户集团状态查询
    TgroupOpenStatus: 'select 状态 from 商户集团信息表 where 集团编号=?',
    // 修改商户集团状态
    TchangeGroupOpenStatus: 'update 商户集团信息表 set 状态=? where 集团编号=?',


    // 不可上传表格
    // 商户信息
    TcorpInfo: 'select * from 商户信息表',
    // 判断新增商户所属集团是否存在，以及该集团的启用状态
    TaddCorpInfo_queryGroupID: 'select count(*) AS 存在数,状态  from 商户集团信息表 where 集团编号=?',
    // 查询最后一个商户id，以创建自增id
    TaddCorpInfo_queryLastCorpID: 'SELECT 商户代码 FROM 商户信息表 ORDER BY 商户代码 DESC LIMIT 1;',
    // 新增商户信息
    TaddCorpInfo: 'INSERT INTO 商户信息表(商户代码, 商户名称,商户银行账号,商户对账联系人,商户对账联系人电话,商户对账联系人邮箱,商户对账联系人备注,结算类型,是否支持退货,商户类型,集团编号,商户地址,状态) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
    // 商户所属集团状态查询
    TchangeCorpOpenStatus_queryGroupStatus: 'SELECT `商户集团信息表`.`状态` FROM `商户集团信息表` INNER JOIN `商户信息表` ON `商户集团信息表`.`集团编号` = `商户信息表`.`集团编号` WHERE `商户信息表`.`商户代码` = ?',
    // 商户状态查询
    TcorpOpenStatus: 'select 状态 from 商户信息表 where 商户代码=?',
    // 修改商户状态
    TchangeCorpOpenStatus: 'update 商户信息表 set 状态=? where 商户代码=?',


    // 不可上传表格
    // 进货表（首页下载）
    TstockInfo: 'select * from 进货表',
    // 子进货表（首页下载）
    TsubStockInfo: 'select * from 子进货表',

    // 不可上传表格
    // 缴费项目
    TproductList: 'select * from 商品清单',
    // 缴费项目上架状态查询
    TproductOpenStatus: 'select 商品状态 from 商品清单 where 商品编号=?',
    // 缴费项目上架状态更改
    TchangeProductOpenStatus: 'update 商品清单 set 商品状态=? where 商品编号=?',
    // 缴费项目上传
    TproductUpload: 'INSERT INTO 商品清单(商品编号,商品名称,商品单价,商户代码,商品状态,属性1,属性2,属性3,备注) VALUES(?,?,?,?,?,?,?,?,?)',
    // 查询最后一个商品id
    TaddProductInfo_queryLastProductID: 'SELECT 商品编号 FROM 商品清单 ORDER BY 商品编号 DESC LIMIT 1;',
    // 新增商品信息
    TaddProductInfo: 'INSERT INTO 商品清单(商品编号,商品名称,商品单价,商户代码,商品状态,属性1,属性2,属性3,备注) VALUES(?,?,?,?,?,?,?,?,?)',


    // 缴费订单管理
    TallOrders: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态`,`订单信息表`.`创建时间`,`订单信息表`.`支付时间`,`订单信息表`.`支付期限`,`订单信息表`.`支付失败原因` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`订单支付状态` = 2 OR `订单信息表`.`订单支付状态` = 3 ORDER BY `订单信息表`.`订单支付状态` DESC,`子订单信息表`.`子订单编号` DESC,`订单信息表`.`学号` ASC;',

    // 缴费记录管理
    TpaymentRecords: 'SELECT `订单信息表`.`学号`,`子订单信息表`.`子订单编号`,`子订单信息表`.`订单编号`,`子订单信息表`.`商品编号`,`商品清单`.`商品名称`,`子订单信息表`.`商品数量`,`子订单信息表`.`商品单价`,`子订单信息表`.`子订单总额`,`子订单信息表`.`商户代码`,`商户信息表`.`商户名称`,`商品清单`.`属性1`,`商品清单`.`属性2`,`商品清单`.`属性3`, `订单信息表`.`订单支付状态`,`订单信息表`.`创建时间`,`订单信息表`.`支付时间`,`订单信息表`.`支付期限`,`订单信息表`.`支付失败原因`,`订单信息表`.`支付渠道` FROM `子订单信息表` INNER JOIN `订单信息表`ON `订单信息表`.`订单编号` = `子订单信息表`.`订单编号` INNER JOIN `商户信息表`ON `子订单信息表`.`商户代码` = `商户信息表`. `商户代码` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子订单信息表`.`商品编号` WHERE `订单信息表`.`订单支付状态` = 0 OR `订单信息表`.`订单支付状态` = 1 OR `订单信息表`.`订单支付状态` = 4 OR `订单信息表`.`订单支付状态` = 5 ORDER BY `订单信息表`.`订单支付状态` ASC,`子订单信息表`.`子订单编号` DESC,`订单信息表`.`学号` ASC;',
    // 教师端删除缴费记录
    TdeleteOrderRecord: 'DELETE FROM `订单信息表` WHERE `订单编号` = ?; DELETE FROM `子订单信息表` WHERE `订单编号` = ?',



    // 不可上传表格
    // 供货管理
    TstockList: 'SELECT `子进货表`.`子采购编号`, `子进货表`.`采购编号`, `子进货表`.`商品编号`, `子进货表`.`商品单价`, `子进货表`.`数量`, `子进货表`.`子采购总额`, `进货表`.`金额`, `进货表`.`供应商商户号`, `进货表`.`供应商名称`, `进货表`.`集团编号`,`商品清单`.`商品名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `进货表` INNER JOIN `子进货表` ON `进货表`.`采购编号` = `子进货表`.`采购编号` INNER JOIN `商品清单` ON `商品清单`.`商品编号` = `子进货表`.`商品编号` ORDER BY `子进货表`.`子采购编号` ASC',
    // 删除采购记录
    TdeleteStockRecord: 'DELETE FROM `进货表` WHERE `采购编号` = ?; DELETE FROM `子进货表` WHERE `采购编号` = ?',


    // 教材计划管理
    TcoursePlans: 'select * from 教材计划',
    // 查询最后一个商品id
    TcoursePlansUpload_queryLastProductID: 'SELECT 商品编号 FROM 商品清单 ORDER BY 商品编号 DESC LIMIT 1;',
    // 教材计划上传+商品信息上传
    TcoursePlansUpload: 'INSERT INTO 教材计划(教材代码,学院,单价,专业,学期,课程名,教材名,出版社) VALUES(?,?,?,?,?,?,?,?);INSERT INTO 商品清单(商品编号,商品名称,商品单价,商户代码,商品状态,属性1,属性2,属性3,备注) VALUES(?,?,?,?,?,?,?,?,?)',
    // 教材计划
    TdeleteCoursePlan: 'DELETE FROM `教材计划` WHERE `教材代码` = ?; DELETE FROM `商品清单` WHERE `商品编号` = ?',

    // 清算统计管理
    TclearInfo: 'select * from 清算表',
    // 清算统计上传
    // TclearInfoUpload: 'INSERT INTO 清算表(清算号,采购编号,定金金额,定金状态,尾款,尾款状态,定金支付时间,尾款支付期限) VALUES(?,?,?,?,?,?,?,?)',
    // 删除清算统计
    TdeleteClearInfo: 'DELETE FROM 清算表 WHERE 清算号 = ?',



    // 资金发放管理
    TscholarshipInfo: 'select * from 奖学金信息表',
    // 资金发放信息上传
    TscholarshipInfoUpload: 'INSERT INTO 奖学金信息表(发放编号,学号,奖学金类型,名称,等级,金额,资金发放时间,发放渠道) VALUES(?,?,?,?,?,?,?,?)',
    // 删除资金发放
    TdeleteScholarship: 'DELETE FROM 奖学金信息表 WHERE 发放编号 = ?',
    // 查询最后一个资金发放id
    TscholarshipInfoUpload_queryLastScholarshipID: 'SELECT 发放编号 FROM 奖学金信息表 ORDER BY 发放编号 DESC LIMIT 1;',

    // 批量创建必缴订单页信息——选择商品
    TcreatOrdersInBatches_CPro_queryAllProducts: 'SELECT `商品清单`.`商品编号`, `商品清单`.`商品名称`, `商品清单`.`商品单价`, `商户信息表`.`商户名称`,`商品清单`.`属性1`, `商品清单`.`属性2`, `商品清单`.`属性3` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码` ORDER BY `商品清单`.`商品编号` ASC',
    // 批量创建必缴订单页信息——选择学号
    TcreatOrdersInBatches_CStu_queryAllStudents: 'select * from 用户信息表 where 在读状态 = 1',
    // 批量创建必缴订单页信息——选择窗口期
    TcreatRequiredOrder: 'INSERT INTO `订单信息表`(`交易单号`, `创建时间`, `学号`, `支付期限`,`订单支付状态`) VALUES(?,?,?,?,"3")',
    // 批量创建必缴订单页信息——创建供货信息——查询 商品编号、商品单价、商户代码
    TinsertStockInfo_queryPro: 'SELECT DISTINCT `商品清单`.`商品编号`,`商品清单`.`商品单价`,`商品清单`.`商户代码` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码`WHERE`商品清单`.`商品编号` IN (?) ORDER BY `商品清单`.`商户代码` ASC;',
    // 批量创建必缴订单页信息——创建供货信息——查询 商户代码、商户名称、集团编号
    TinsertStockInfo_queryCor: 'SELECT DISTINCT `商品清单`.`商户代码`, `商户信息表`.`商户名称`,`商户信息表`.`集团编号` FROM `商品清单` INNER JOIN `商户信息表` ON `商品清单`.`商户代码` = `商户信息表`.`商户代码` , `子进货表` , `进货表` WHERE `商品清单`.`商品编号` IN (?) ORDER BY `商品清单`.`商户代码` ASC;',
    // 批量创建必缴订单页信息——创建供货信息——查询最后一个进货编号（采购编号）
    TinsertStockInfo_queryLastStockID: 'SELECT 采购编号 FROM 进货表 ORDER BY 采购编号 DESC LIMIT 1;SELECT 清算号 FROM 清算表 ORDER BY 清算号 DESC LIMIT 1;',
    // 批量创建必缴订单页信息——创建供货信息——插入供货信息
    TinsertStockInfo_insertStockInfo: 'INSERT INTO `进货表`(`采购编号`, `金额`, `供应商商户号`, `供应商名称`,`集团编号`) VALUES(?,?,?,?,?);INSERT INTO `清算表`(`清算号`,`采购编号`, `定金金额`, `定金状态`, `尾款状态`) VALUES(?,?,?,?,?);',
    // 批量创建必缴订单页信息——创建供货信息——插入子供货信息
    TinsertStockInfo_insertSubStockInfo: 'INSERT INTO `子进货表`(`子采购编号`,`采购编号`, `商品编号`, `商品单价`, `数量`,`子采购总额`) VALUES(?,?,?,?,?,?)',
    insert: 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
    update: 'update user set name=?, age=? where id=?',
    delete: 'delete from user where id=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
};

module.exports = user;