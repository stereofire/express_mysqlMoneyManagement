var tableToExcel = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function (s) {
            return window.btoa(unescape(encodeURIComponent(s)))
        },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            })
        }
    return function (table, name, filename) {
        if (!table.nodeType)
            table = document.getElementById(table)
        var ctx = {
            worksheet: name || 'Worksheet',
            table: table.innerHTML
        }
        document.getElementById("dlink").href = uri + base64(format(template, ctx));
        console.log(document.getElementById("dlink").href);
        document.getElementById("dlink").download = filename;
        document.getElementById("dlink").click();
    }
})()


function closePOP() {
    document.getElementById("coverLayer").style.display = 'none';
}

function showPOP() {
    document.getElementById("coverLayer").style.display = 'block';
}

var extArray = new Array(".xls", ".xlsx");
function LimitAttach(form, file) {
    allowSubmit = false;
    if (!file) {
        alert("您还未选择文件");
    } else {
        while (file.indexOf("\\") != -1)
            file = file.slice(file.indexOf("\\") + 1);
        ext = file.slice(file.indexOf(".")).toLowerCase();
        for (var i = 0; i < extArray.length; i++) {
            if (extArray[i] == ext) {
                allowSubmit = true;
                break;
            }
        }
        if (allowSubmit) {
            // console.log("类型合法");
            form.submit();
        } else
            alert("抱歉，目前仅允许上传的文件类型是: " + (extArray.join(" ")) + "\n请重新选择文件并上传。");
    }
}