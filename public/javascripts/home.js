

function changeForm(){
	if(check_keyChange()){
		document.change.submit();
	}else{
		return false;
	}
}
function check_keyChange(){
	var my_account = document.forms["keyPassage"]["account"].value;
	var my_old_password = document.forms["keyPassage"]["old_password"].value;
	var my_new_password = document.forms["keyPassage"]["new_password"].value;
	var my_new_again_password = document.forms["keyPassage"]["new_again_password"].value;
	if(my_account == null || my_account == "")
{
		alert("请输入账号");
		return false;
	}
	if(my_old_password == null || my_old_password == "")
	{
		alert("请输入原密码");
		return false;
    }
    if(my_new_password == null || my_new_password == "")
	{
		alert("请输入新密码");
		return false;
		}
		if(my_new_password == my_old_password)
	{
		alert("新密码不可与原密码相同！");
		return false;
		}
    if(my_new_again_password == null || my_new_again_password == "")
	{
		alert("请再次输入新密码");
		return false;
    }
    if(my_new_password != my_new_again_password )
	{
		alert("两次新密码不相同，请重新检查，再次输入");
		return false;
	}
	return validate();
}

var code; //在全局定义验证码    
//产生验证码   
window.onload = function() {
	createCode();
}

function createCode() {
	code = "";
	var codeLength = 4; //验证码的长度   
	var checkCode = document.getElementById("checkCode");
	var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
		'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //随机数   
	for(var i = 0; i < codeLength; i++) { //循环操作   
		var charIndex = Math.floor(Math.random() * 36); //取得随机数的索引   
		code += random[charIndex]; //根据索引取得随机数加到code上   
	}
	document.getElementById("code").innerHTML = code;//把code值赋给验证码   
}
//校验验证码   
function validate() {
	var inputCode = document.getElementById("input").value.toUpperCase(); //取得输入的验证码并转化为大写         
	if(inputCode.length <= 0) { //若输入的验证码长度为0   
		alert("请输入验证码！"); //则弹出请输入验证码
		return false;   
	}else if(inputCode != code) { //若输入的验证码与产生的验证码不一致时   
		alert("验证码输入错误！"); //则弹出验证码输入错误   
		createCode(); //刷新验证码   
		return false;
	}else{
		return true;
	}
}
