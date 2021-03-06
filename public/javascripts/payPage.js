// 提交支付密码表单
function changeForm() {
	if (check_changeForm()) {
		var tradeID = document.getElementById("tradeID").innerHTML;
		var account = document.getElementById("account").value;
		var password = document.getElementById("password").value;
		console.log("tradeID:", tradeID, "account:", account, "password:", password);
		var postData = {
			method: "支付交易",
			tradeID: tradeID,
			username: account,
			password: password
		};
		postData = JSON.stringify(postData);
		console.log(postData);
		$.post("http://114.115.222.89:20056/PaySim", postData, function (data, status) {
			data = JSON.parse(data);
			var payResult = data.result;
			console.log(data, payResult);
			if (payResult == "支付成功") {
				location.href = "/paymentResult?payResult=" + payResult + "&orderNo=" + tradeID;
			}else{
				location.href = "/paymentResult?payResult=" + payResult + "&orderNo=" + tradeID;
			}
		})
	} else {
		console.log("check_changeForm error, u can't submit the form.");
		return false;
	}
}

function check_changeForm() { //账号密码是否为空	
	var my_account = document.forms["keyPassage"]["account"].value;
	var password = document.forms["keyPassage"]["password"].value;
	if (my_account == null || my_account == "") {
		alert("请输入支付账号");
		return false;
	} else if (password == null || password == "") {
		alert("请支付密码");
		return false;
	} else {
		return verifyCode();
	}
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