function siftProductList() {
    document.choiceForm.submit();
}

function checkOptions() {
    var keys = ''; //url传参用的数组字符串

    // 以下为获取已经在购物车里的商品id和学生id
    var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
    var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
    var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
    var oldKey = Object.keys(jsonAllDataObj); //获得购物车内（JSON对象）所有键值对的键（商品id），为arr object类型
    console.log("jsonAllDataObj.keys()", oldKey, typeof (oldKey), oldKey.length);

    var oldProIDLength = 0; //统计购物车内已有的商品数量
    var oldStuIDLength = 0; //统计购物车内已有的学生学号数量

    for (var item in oldKey) {
        var itemToString = JSON.stringify(oldKey[item]);
        // console.log(item, itemToString);
        if (itemToString.indexOf("goods") != -1) {
            if (oldProIDLength + oldStuIDLength == 0) {
                keys = "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
            } else {
                keys += "&" + "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
            }
            oldProIDLength++;
        } else if (itemToString.indexOf("stuIDs") != -1) {
            if (oldProIDLength + oldStuIDLength == 0) {
                keys = "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
            } else {
                keys += "&" + "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
            }
            oldStuIDLength++;
        }
    }
    console.log("oldProIDLength:", oldProIDLength);
    console.log("oldStuIDLength:", oldStuIDLength);
    console.log("keys:", keys);
    // var productQuantity = oldProIDLength; //用以统计所有选择的商品数量

    // 统计是否有新商品被勾选，有则写入session并跳转，无则驳回跳转
    // var checkboxlist = document.getElementsByTagName("input");//会导致没有原因的i计数后移6位，可能与异步有关
    // var checkboxlist = document.getElementsByName("No");
    var checkboxlist = document.getElementsByName("check"); //正解

    console.log("checkboxlist:", checkboxlist);
    var check = false; //是否有商品被勾选
    var newProIDLength = 0;
    for (var i = 0; i < checkboxlist.length;) {
        // var id = i.toString();
        // var id = parseInt(checkboxlist[i].innerHTML) - 1;
        var item = document.getElementById(i);
        // var checkbox = item.cells[9].innerHTML;
        // console.log(item.cells[9], checkbox, checkbox.checked);
        // if (checkboxlist[id].type == "checkbox" && checkboxlist[id].checked == true) {
        if (checkboxlist[i].checked == true) {
            newProIDLength++; // 重要，解决每次购物车为空时添加商品跳转确认只有最后一个的问题
            console.log("i:", i);
            check = true;

            // 将商品信息写入session
            // console.log(item);
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
            // 判断该商品是否已经在购物车内
            var pronum = item.cells[1].innerHTML;
            for (var o in oldKey) {
                var oToString = JSON.stringify(oldKey[o]);
                oToString = oToString.slice(1, -1);
                console.log(o, oToString,key);
                if ((oToString.indexOf("goods") != -1) && (oToString == key)) {
                    var alertStr = "抱歉，商品编号为："+pronum+"的商品已存在您的购物车内！\n 如需增加数量请先至“查看已添加”页面删除该商品后重新添加！";
                    alert(alertStr);
                    return false;
                }
            }
            // 当前购物车为空且为第一个新添加商品
            console.log(oldProIDLength, oldStuIDLength, newProIDLength)
            if (oldProIDLength + oldStuIDLength + newProIDLength == 0) {
                keys = "ProIDs[]=" + key; //用于url传参
            } else {
                keys += "&" + "ProIDs[]=" + key;
            }
            sessionStorage.setItem(key, JsonData);
            console.log("keys:", keys.length, keys);
            i++;

        } else {
            i++;
        }
    }
    if (check == false) {
        alert("还未勾选缴费商品哦！");
    } else {
        console.log(i);
        if (i == checkboxlist.length) {
            console.log("有缴费商品被勾选,已经加入sessionstorage购物车，现在跳转至商品确认页面");
            console.log("keys.length,keys:", keys.length, keys);
            // 重置所有勾选框为未勾选状态
            for (var j = 0; j < checkboxlist.length; j++) {
                checkboxlist[j].checked = false;
            }
            // 跳转
            location.href = '/TcreatOrdersInBatches_Pconfirm?' + keys;
        }
    }

}