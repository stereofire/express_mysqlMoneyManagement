var express = require('express');
var router = express.Router();
var ejs=require('ejs');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.render('index',{ title: 'Express' });
  ejs.renderFile('./views/index.ejs',{},function(err,data){
    if(err){
      console.log(err);
    }
    console.log(data);
    res.end(data);
  })
  
});

module.exports = router;
