
function checkOptions() {
    var keys = '';
    if (sessionStorage.valueOf().length == 0) { //确实是购物车没东西
        var kk = 0;
    } else {
        var kk = sessionStorage.valueOf().length; //购物车已经有东西了，个数为kk
    }
    // 以下为获取已经在购物车里的商品id
    var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
    // console.log(allData);
    // console.log(typeof (allData));
    var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
    var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
    // console.log(jsonAllDataObj);
    // console.log(typeof (jsonAllDataObj));
    var oldKey = Object.keys(jsonAllDataObj);
    console.log("jsonAllDataObj.keys()", oldKey);
    var oldKeyLength = 0;
    for (var item in oldKey) {
        oldKeyLength++;
    }
    console.log("oldKeyLength:",oldKeyLength);
    for (var j = 0; j < oldKeyLength; j++) {
        if(j == 0){
            keys = "keys[]=" + oldKey[j] + "&";
        }else{
            keys = keys + "keys[]=" + oldKey[j] + "&";
        }
        console.log(keys);
    }
    var length = keys.length - 1;
    keys = keys.substr(0, length);
    
    var checkboxlist = document.getElementsByTagName("input");
    var check = false;


    for (var i = 0; i < checkboxlist.length; i++) {
        if (checkboxlist[i].type == "checkbox" && checkboxlist[i].checked == true) {
            check = true;
            var item = document.getElementById(i);

            var JsonData = new Object();
            JsonData.商品编号 = item.cells[1].innerHTML;
            JsonData.商品名称 = item.cells[2].innerHTML;
            JsonData.属性1 = item.cells[3].innerHTML;
            JsonData.属性2 = item.cells[4].innerHTML;
            JsonData.属性3 = item.cells[5].innerHTML;
            JsonData.商品单价 = item.cells[6].innerHTML;
            var myselect = document.getElementById("select" + i);
            JsonData.数量 = myselect.value;
            JsonData.keysid = 'goods' + i;
            // console.log(JsonData);
            //存储数据前：利用JSON.stringify将对象转换成字符串
            JsonData = JSON.stringify(JsonData);
            var key = 'goods' + i;
            if (kk == 0) { //购物车为空
                keys = "keys[]=" + key + "&"; //用于url传参
                kk++;
            } else {
                keys = keys + "keys[]=" + key + "&";
                kk++;
            }

            sessionStorage.setItem(key, JsonData);
            // var goods = sessionStorage.getItem(key);
            // console.log(goods);
            // keys.forEach(element => {
            //     console.log(element);
            // });
        }
    }
    if (check == false) {
        console.log("还未勾选缴费商品哦！");
        alert("还未勾选缴费商品哦！");
    } else {
        console.log("已经勾选缴费商品,加入sessionstorage购物车并跳转");
        //获取第一位到 倒数第二位(包括)
        console.log(keys.length);
        console.log(keys);
        var length = keys.length - 1;
        console.log(length);
        keys = keys.substr(0, length);
        console.log(keys);
        // var loves = document.getElementsByTagName("input");
        for (var i = 0; i < checkboxlist.length; i++) {
            checkboxlist[i].checked = false;
        }
        location.href = '/orderConfirm?' + keys;
    }
}