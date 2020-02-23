
// function sendForm() {
// 	if (check_login()) {
// 		document.send.submit();
// 		return ture;
// 	} else {
// 		return false;
// 	}
// }
function check_login() {//账号密码是否为空	
	var my_account = document.forms["user_login"]["account"].value;
	var my_password = document.forms["user_login"]["password"].value;
	if (my_account == null || my_account == "") {
		alert("请输入账号");
		return false;
	}
	if (my_password == null || my_password == "") {
		alert("请输入密码");
		return false;
	}
	return verifyCode();
}

var code; //在全局定义验证码    
//产生验证码   
window.onload = function () {
	createCode();
	console.log('code onload');
}

function createCode() {
	code = "";
	var codeLength = 4; //验证码的长度   
	var checkCode = document.getElementById("checkCode");
	var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
		"S", "T", "U", "V", "W", "X", "Y", "Z"); //随机数   
	for (var i = 0; i < codeLength; i++) { //循环操作   
		var charIndex = Math.floor(Math.random() * 36); //取得随机数的索引   
		code += random[charIndex]; //根据索引取得随机数加到code上   
	}
	document.getElementById("code").innerHTML = code; //把code值赋给验证码   
}
//校验验证码   
function verifyCode() {
	var inputCode = document.getElementById("input").value.toUpperCase(); //取得输入的验证码并转化为大写         
	if (inputCode.length <= 0) { //若输入的验证码长度为0   
		alert("请输入验证码！"); //则弹出请输入验证码
		return false;
	} else if (inputCode != code) { //若输入的验证码与产生的验证码不一致时   
		alert("验证码输入错误！"); //则弹出验证码输入错误   
		createCode(); //刷新验证码   
		return false;
	} else {
		// return verifyPassword();
		var my_account = document.forms["user_login"]["account"].value;
		var my_password = document.forms["user_login"]["password"].value;
		if(check(my_account, my_password)){
			alert("登录成功！");
			return ture;
		}else{
			alert("密码或账户输入错误，请重新登录");
			return false;
		}
	}
}

// function verifyPassword(){
// 	var my_account = document.forms["user_login"]["account"].value;
// 	var my_password = document.forms["user_login"]["password"].value;
// 	if(check(my_account, my_password)){
// 		alert("登录成功！");
// 		return ture;
// 	}else{
// 		alert("密码或账户输入错误，请重新登录");
// 		return false;
// 	}
// }


var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('../dao/userSqlMapping');
// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

function check(my_account, my_password){
	pool.getConnection(function (err, connection) {
		if(err){//数据库连接错误
			console.log(err);
			return false;
		}
		connection.query($sql.check, my_account, function (err, result) {
			if(err){//用户账户查询错误
				console.log(err);
				connection.release();
				return false;
			}else{//用户存在
				console.log(result);
				if(result == my_password){//密码正确
					connection.release();
					return ture;
				}else{
					console.log('密码错误');
					connection.release();
					return false;
				}
			}
			// connection.release();
		});
	});
}