function sendForm() {
	// console.log(document.forms["userLogin"]);
	// var ip = document.forms["userLogin"]["ip"].value;
	// alert("ip：",ip);
	// console.log("ip元素：",document.forms["userLogin"]["ip"]);
	// if(ip == ""){
	// 	alert("ip为空");
	// }
	// return false;
	if (check_login()) {
		document.userLogin.submit();
	} else {
		console.log("check_login error, u can't submit the login form.");
		return false;
	}
}

function check_login() { //检查输入合法性	
	var my_account = document.forms["userLogin"]["account"].value;
	var my_password = document.forms["userLogin"]["password"].value;
	if (my_account == null || my_account == "") {
		alert("请输入账号");
		return false;
	} else if (pattern.test(my_account)) {
		alert("账号有非法字符!");
	} else if (my_password == null || my_password == "") {
		alert("请输入密码");
		return false;
	} else if (my_password.length < 8) {
		alert("密码长度不能小于8位");
		return false;
	} else if (my_password.length > 14) {
		alert("密码长度不能大于14位");
		return false;
	} else if (pattern.test(my_password)) {
		alert("密码有非法字符!");
	} else {
		return verifyCode();
	}

	
}
var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")

function stripscript(s) {
	var rs = "";
	for (var i = 0; i < s.length; i++) {
		rs = rs + s.substr(i, 1).replace(pattern, '');
	}
	return rs;
}

var code; //在全局定义验证码    

function createCode() { //生成验证码
	code = "";
	var codeLength = 4; //验证码的长度   
	// var checkCode = document.getElementById("checkCode");
	var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
		"S", "T", "U", "V", "W", "X", "Y", "Z"); //随机数   
	for (var i = 0; i < codeLength; i++) { //循环操作   
		var charIndex = Math.floor(Math.random() * 36); //取得随机数的索引   
		code += random[charIndex]; //根据索引取得随机数加到code上   
	}
	document.getElementById("code").innerHTML = code; //把code值赋给验证码   
	console.log("code onloaded");
}
//校验验证码非空和正确
function verifyCode() {
	var inputCode = document.getElementById("codeinput").value.toUpperCase(); //取得输入的验证码并转化为大写         
	if (inputCode.length <= 0) { //若输入的验证码长度为0   
		alert("请输入验证码！"); //则弹出请输入验证码
		return false;
	} else if (inputCode != code) { //若输入的验证码与产生的验证码不一致时   
		alert("验证码输入错误！"); //则弹出验证码输入错误   
		createCode(); //刷新验证码   
		return false;
	} else {
		return true;
	}
}