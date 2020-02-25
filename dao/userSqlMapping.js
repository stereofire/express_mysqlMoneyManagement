// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    check:'select * from 用户信息表_copy1 where 学号=?',
    insert:'INSERT INTO user(id, name, age) VALUES(0,?,?)',
    update:'update user set name=?, age=? where id=?',
    delete: 'delete from user where id=?',
    queryById: 'select * from user where id=?',
    queryAll: 'select * from user'
    };
     
    module.exports = user;