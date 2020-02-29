// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    check:'select * from 用户信息表_copy1 where 学号=?',
    changePssword:'update 用户信息表_copy1 set 密码=? where 学号=?',
    // changePssword2:'if((select 密码 from 用户信息表_copy1 where 学号=?)==?) update 用户信息表_copy1 set 密码=? where 学号=?',
    TotalAmount:'SELECT SUM(`交易金额`) AS totalAmount FROM `订单信息表` WHERE `学号`=?',
    insert:'INSERT INTO user(id, name, age) VALUES(0,?,?)',
    update:'update user set name=?, age=? where id=?',
    delete: 'delete from user where id=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
    };
     
    module.exports = user;