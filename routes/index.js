var express = require('express');
var router = express.Router();
var ejs=require('ejs');
var url=require('url');
var fs=require('fs');

/* GET login page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.render('index',{ title: 'Express' });
  var method=req.method.toLowerCase();
  console.log(method);
  var pathname=url.parse(req.url,true).pathname;
  if(pathname=='/' && method=='get'){  /*显示登录页面*/
    console.log(pathname + 'hhhhhhhh');
		ejs.renderFile('./views/index.ejs',{},function(err,data){
      if(err){
        console.log(err);
      }
      res.end(data);
    })
  }else if(pathname=='/' && method=='post'){  /*执行登录的操作*/
		//post提交数据，参数不会传入url，而是存入请求头headers的formdata中
		var postStr='';
		req.on('data',function(chunk){
			postStr+=chunk;
		})
		req.on('end',function(err,chunk){
      if(err) throw err;
			console.log(postStr);
			fs.appendFile('login.txt',postStr+'\n',function(err){
				if(err){
					console.log(err);
					return;
				}
				console.log('写入数据成功');
			})
			res.end("<script>alert('登录成功');history.back();</script>")
    })
  }else{
    ejs.renderFile('./views/index.ejs',{},function(err,data){
      if(err){
        console.log(err);
      }
      res.end(data);
    })
  }
});
module.exports = router;


// exports.form = function(req, res){
//   ejs.renderFile('./views/index.ejs',{},function(err,data){
//     if(err){
//       console.log(err);
//     }
//     res.end(data);
//   })
// };

// exports.submit = function(req, res, next){
//   var data = req.body.user;
//   User.authenticate(data.name, data.pass, function(err, user){
//     if (err) return next(err);
//     if (user) {
//       req.session.uid = user.id;
//       res.redirect('/');
//     } else {
//       res.error("Sorry! invalid credentials.");
//       res.redirect('back');
//     }
//   });
// };
