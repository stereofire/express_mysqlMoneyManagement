// // 进入密码修改页
// function gotoChangePassword(){
//     var xmlhttp;
// 	if (window.XMLHttpRequest)
// 	{
// 		//  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
// 		xmlhttp=new XMLHttpRequest();
// 	}
// 	else
// 	{
// 		// IE6, IE5 浏览器执行代码
// 		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
// 	}
// 	xmlhttp.onreadystatechange=function()
// 	{
// 		if (xmlhttp.readyState==4 && xmlhttp.status==200)
// 		{
// 			document.getElementById("queryResult").innerHTML=xmlhttp.responseText;
// 		}
// 	}
// 	xmlhttp.open("POST","/changePassword/changePassword",true);
// 	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
// }

// 导航跳转