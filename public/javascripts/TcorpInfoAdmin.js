function changeOpenStatus(corpID, OpenStatus) {
    if (OpenStatus == 1) {
        if (confirm("确定修改该供应商的启用状态吗？\u000d商户代码：" + corpID + "启用状态将改为：禁用")) {
            // location.href = '/TstudentInfoAdmin?changeOpenStatus=' + corpID;
            alert("已修改供应商" + corpID + "的启用状态：禁用");
        }
    } else if (OpenStatus == 0) {
        if (confirm("确定修改该供应商的启用状态吗？\u000d商户代码：" + corpID + "启用状态将改为：启用")) {
            location.href = '/TstudentInfoAdmin?changeOpenStatus=' + corpID;
            alert("已修改供应商" + corpID + "的启用状态：启用");
        }
    }
}

function querycorpInfo() {
    var corpID = document.forms["choiceForm"]["corpID"].value;
    var corpName = document.forms["choiceForm"]["corpName"].value;
    var corpBankNo = document.forms["choiceForm"]["corpBankNo"].value;
    var corpPrincipal = document.forms["choiceForm"]["corpPrincipal"].value;
    var corpPrinPhone = document.forms["choiceForm"]["corpPrinPhone"].value;
    var corpSettleType = document.forms["choiceForm"]["corpSettleType"].value;
    var corpReturnGoods = document.forms["choiceForm"]["corpReturnGoods"].value;
    var corpType = document.forms["choiceForm"]["corpType"].value;
    var groupID = document.forms["choiceForm"]["groupID"].value;
    var corpOpenStatus = document.forms["choiceForm"]["corpOpenStatus"].value;
    console.log(corpID, corpName, corpBankNo, corpPrincipal,corpPrinPhone,corpSettleType,corpReturnGoods,corpType,groupID,corpOpenStatus);

    const corpTBody = document.getElementById("corpTBody");
    for (var i = 0; i < corpTBody.rows.length; i++) { //遍历行
        corpTBody.rows[i].style.display = "";
    }
    // console.log(corpTBody);
    for (var i = 0; i < corpTBody.rows.length; i++) { //遍历行
        for (var j = 0; j < corpTBody.rows[i].cells.length; j++) { //遍历列
            if (j == 0 && corpID != "") { //corpID有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpID)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 1 && corpName != "") { //corpName有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpName)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 2 && corpBankNo != "") { //corpBankNo有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpBankNo)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 3 && corpPrincipal != "") { //corpPrincipal有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpPrincipal)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 4 && corpPrinPhone != "") { //corpPrinPhone有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpPrinPhone)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 7 && corpSettleType != 0) { //corpSettleType有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpSettleType)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 8 && corpReturnGoods != 0) { //corpReturnGoods有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpReturnGoods)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 9 && corpType != "") { //corpType有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpType)
                    corpTBody.rows[i].style.display = "none";
            }
            if (j == 10 && groupID != "") { //groupID有值
                if (corpTBody.rows[i].cells[j].innerHTML != groupID)
                    corpTBody.rows[i].style.display = "none";
                // console.log(groupID);
            }
            if (j == 12 && corpOpenStatus != 0) { //corpOpenStatus有值
                if (corpTBody.rows[i].cells[j].innerHTML != corpOpenStatus)
                    corpTBody.rows[i].style.display = "none";
            }
        }
    }
}