function siftStuInfo() {
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

    // 统计是否有新学生被勾选，有则写入session并跳转，无则驳回跳转
    // var checkboxlist = document.getElementsByTagName("input");
    var checkboxlist = document.getElementsByName("check"); //正解

    console.log("checkboxlist:", checkboxlist);
    var check = false; //是否有学生被勾选
    var newStuIDLength = 0;
    for (var i = 0; i < checkboxlist.length;) {
        var item = document.getElementById(i);
        if (checkboxlist[i].checked == true) {
            newStuIDLength++; // 重要，解决每次购物车为空时添加商品跳转确认只有最后一个的问题
            console.log("i:", i);
            check = true;
            // 将学生信息写入session
            // var item = document.getElementById(i);
            var JsonData = new Object();
            JsonData.学号 = item.cells[1].innerHTML;
            JsonData.学校 = item.cells[2].innerHTML;
            JsonData.姓名 = item.cells[3].innerHTML;
            JsonData.院系 = item.cells[4].innerHTML;
            JsonData.专业 = item.cells[5].innerHTML;
            JsonData.性别 = item.cells[6].innerHTML;
            JsonData.年级 = item.cells[7].innerHTML;
            JsonData.keysid = 'stuIDs' + i;
            // console.log(JsonData);
            //存储数据前：利用JSON.stringify将对象转换成字符串
            JsonData = JSON.stringify(JsonData);
            var key = 'stuIDs' + i;
            // 判断该学生是否已经在购物车内
            var stunum = item.cells[1].innerHTML;
            for (var o in oldKey) {
                var oToString = JSON.stringify(oldKey[o]);
                oToString = oToString.slice(1, -1);
                console.log(o, oToString, key);
                if ((oToString.indexOf("stuIDs") != -1) && (oToString == key)) {
                    var alertStr = "抱歉，学号为：" + stunum + "的学到已存在您的批量必缴计划内！";
                    alert(alertStr);
                    return false;
                }
            }
            // 当前购物车为空且为第一个新添加学号
            if (oldProIDLength + oldStuIDLength + newStuIDLength== 0) { // 当前购物车为空
                keys = "stuIDs[]=" + key + "&"; //用于url传参
            } else {
                keys += "&" + "stuIDs[]=" + key;
            }
            sessionStorage.setItem(key, JsonData);
            console.log("keys:", keys.length, keys);
            i++;

        } else {
            i++;
        }
    }
    if (check == false) {
        alert("还未勾选缴费学生哦！");
    } else {
        console.log(i);
        if (i == checkboxlist.length) {
            console.log("有缴费学生被勾选,已经加入sessionstorage购物车，现在跳转至学号确认页面");
            console.log("keys.length,keys:", keys.length, keys);
            // 重置所有勾选框为未勾选状态
            for (var i = 0; i < checkboxlist.length; i++) {
                checkboxlist[i].checked = false;
            }
            // 跳转
            location.href = '/TcreatOrdersInBatches_Sconfirm?' + keys;
        }
    }
}

// //jquery实现    
// //window的scroll事件    
// $(window).scroll(function () {
//     let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
//     console.log(scrollTop); //如果大于1000px，则让a标签显示        
//     if (scrollTop > 1000) {
//         $("a").css({
//             display: "block"
//         })
//     } else {
//         $("a").css({
//             display: "none"
//         })
//     }
// });
// $("a").click(function () {
//     $("html,body").animate({
//         scrollTop: "0px"
//     }, 500); //500毫秒完成回到顶部动画    
// })