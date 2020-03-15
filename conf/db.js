// conf/db.js
// MySQL数据库联接配置
module.exports = {
    mysql: {
        host: '127.0.0.1',
        user: 'root',
        password: '111111',
        database: 'db20200213', 
        port: 3306,
        multipleStatements: true, //一个pool里多条sql查询语句。
        timezone: "08:00"
    }
};
// NO	表名	ID	功能描述	备注
// 1	用户信息表	user_info	学生信息	状态：1在读，0不在读
// 2	商户信息表	corp_info	采购对应转账集团负责人	"结算类型：1全款结算，2分期结算 状态：1启用，0禁用"
// 3	商户集团信息表	group_info	采购对应商户集团信息	状态：1启用，0禁用
// 4	订单信息表	bill_info	每提交的订单信息	订单支付状态：1成功，0失败，2待支付,3教务提交必缴待支付
// 5	子订单信息表	sub_bill_info 	每笔订单下细分的子订单	
// 6	商品清单表	product_list	所有上架商品，包含教材	商品状态：1上架，0下架
// 7	进货表	stock_list	采购订单（针对每个集团）	
// 8	子进货表	sub_stock_list	采购订单细则	
// 9	清算表	clear_info	采购订单支付情况	"定金状态：1已支付，0未支付。 尾款状态：1已支付，0未支付。"
// 10	教材计划	courses_plan	具体教材对应的科目、出版社等信息	
