var ejs = require('ejs');
function changePassword(){
	ejs.renderFile('views/changePassword.ejs',{},function(err,data){
		if(err){
			console.log("渲染密码修改页出错");
		}
		res.end(data);})
}
