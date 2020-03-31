function deleteOrder(orderID) {
    if (confirm("确定删除该订单记录吗？\u000d顶大编号：" + orderID)) {
        // location.href = '/TallOrdersAdmin?deleteOrder=' + orderID;
        alert("已删除订单记录");
    }
}

// 待改进，暂时禁用
// function queryOrderInfo() {
//     var stuID = document.forms["choiceForm"]["stuID"].value;
//     var orderID = document.forms["choiceForm"]["orderID"].value;
//     var subOrderID = document.forms["choiceForm"]["subOrderID"].value;
//     var productID = document.forms["choiceForm"]["productID"].value;
//     var productName = document.forms["choiceForm"]["productName"].value;
//     var corpName = document.forms["choiceForm"]["corpName"].value;
//     var paymentStatus = document.forms["choiceForm"]["paymentStatus"].value;
//     console.log(stuID, orderID, subOrderID, productID, productName,corpName, paymentStatus);

//     const orderTBody = document.getElementById("orderTBody");
//     for (var i = 0; i < orderTBody.rows.length; i++) { //遍历行
//         orderTBody.rows[i].style.display = "";
//     }
//     // console.log(orderTBody);
//     for (var i = 0; i < orderTBody.rows.length; i++) { //遍历行
//         for (var j = 0; j < orderTBody.rows[i].cells.length; j++) { //遍历列
//             if (j == 0 && stuID != "") { //stuID有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != stuID)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 1 && orderID != "") { //orderID有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != orderID)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 2 && subOrderID != "") { //subOrderID有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != subOrderID)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 3 && productID != "") { //productID有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != productID)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 4 && productName != "") { //productName有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != productName)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 11 && corpName != "") { //corpName有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != corpName)
//                     orderTBody.rows[i].style.display = "none";
//             }
//             if (j == 14 && paymentStatus != 0) { //paymentStatus有值
//                 if (orderTBody.rows[i].cells[j].innerHTML != paymentStatus)
//                     orderTBody.rows[i].style.display = "none";
//             }
//         }
//     }
// }