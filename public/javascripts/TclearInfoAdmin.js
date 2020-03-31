function deleteClearInfo(clearID) {
    if (confirm("确定删除该清算记录吗？\u000d清算号：" + clearID )) {
        // location.href = '/TclearInfoAdmin?deleteClearInfo=' + clearID;
        alert("已删除清算记录");
    }
}

function queryClearInfo() {
    var clearID = document.forms["choiceForm"]["clearID"].value;
    var stockID = document.forms["choiceForm"]["stockID"].value;
    var depositStatus = document.forms["choiceForm"]["depositStatus"].value;
    var remainingPaymentStatus = document.forms["choiceForm"]["remainingPaymentStatus"].value;
    console.log(clearID, stockID, depositStatus, remainingPaymentStatus);

    const clearTBody = document.getElementById("clearTBody");
    for (var i = 0; i < clearTBody.rows.length; i++) { //遍历行
        clearTBody.rows[i].style.display = "";
    }
    console.log(clearTBody);
    for (var i = 0; i < clearTBody.rows.length; i++) { //遍历行
        for (var j = 0; j < clearTBody.rows[i].cells.length; j++) { //遍历列
            if (j == 0 && clearID != "") { //clearID有值
                if (clearTBody.rows[i].cells[j].innerHTML != clearID)
                    clearTBody.rows[i].style.display = "none";
            }
            if (j == 1 && stockID != "") { //stockID有值
                if (clearTBody.rows[i].cells[j].innerHTML != stockID)
                    clearTBody.rows[i].style.display = "none";
            }
            if (j == 3 && depositStatus != 0) { //depositStatus有值
                if (clearTBody.rows[i].cells[j].innerHTML != depositStatus)
                    clearTBody.rows[i].style.display = "none";
            }
            if (j == 5 && remainingPaymentStatus != 0) { //remainingPaymentStatus有值
                if (clearTBody.rows[i].cells[j].innerHTML != remainingPaymentStatus)
                    clearTBody.rows[i].style.display = "none";
            }
        }
    }
}