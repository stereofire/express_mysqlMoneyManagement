var fs = require("fs");
var ejsExcel = require("ejsexcel");
var excelta = function (templateFileName, FileName, data, cb) {
    //获取Excel模板的buffer对象
    var exlBuf = fs.readFileSync("public/tableTemplates4downLoad/" + templateFileName + ".xlsx");
    var now = new Date();
    var yy = now.getFullYear(); //年
    var mm = now.getMonth() + 1; //月
    var dd = now.getDate(); //日
    var hh = now.getHours(); //时
    var ii = now.getMinutes(); //分
    var ss = now.getSeconds(); //秒
    var clock = yy;
    if (mm < 10) clock += "0";
    clock += mm;
    if (dd < 10) clock += "0";
    clock += dd;
    if (hh < 10) clock += "0";
    clock += hh;
    if (ii < 10) clock += '0';
    clock += ii;
    if (ss < 10) clock += '0';
    clock += ss;
    var path = FileName + clock + ".xls"; //临时文件名
    //用数据源（对象）data渲染Excel模板
    // console.log(data);
    ejsExcel.renderExcel(exlBuf, data).then(function (exlBuf2) {
        //将数据方进模板开始渲染
        fs.writeFileSync("public/tables4downLoad/" + path, exlBuf2);
        cb(path);
        // res.send(path);
    }).catch(function (err) {
        console.error(err);
    });

}

module.exports = {
    excelta: excelta //导出
};