function deleteOrderRecord(orderID) {
    if (confirm("确定删除该缴费记录吗？\u000d订单编号：" + orderID)) {
        location.href = '/TpaymentRecordsAdmin?deleteOrderRecord=' + orderID;
    }
}

function siftPaymentRecords() {
    document.choiceForm.submit();
    // if (check_choiceForm()) {
    //     document.choiceForm.submit();
    // } else {
    //     console.log("check_choiceForm error, u can't submit the form.");
    //     return false;
    // }
}

// function check_choiceForm() { //是否为空	
//     var stuID = document.forms["choiceForm"]["stuID"].value;
//     var orderID = document.forms["choiceForm"]["orderID"].value;
//     var orderID = document.forms["choiceForm"]["orderID"].value;
//     var productID = document.forms["choiceForm"]["productID"].value;
//     var productName = document.forms["choiceForm"]["productName"].value;
//     var corpName = document.forms["choiceForm"]["corpName"].value;
//     var paymentStatus = document.forms["choiceForm"]["paymentStatus"].value;

//     var re = true;
//     if (stuID == null || stuID == "") {
//         if (orderID == null || orderID == "") {
//             if (orderID == null || orderID == "") {
//                 if (productID == null || productID == "") {
//                     if (productName == null || productName == "") {
//                         if (corpName == null || corpName == "") {
//                             if (paymentStatus == null || paymentStatus == 0) {
//                                 alert("请设置筛选条件！");
//                                 re = false;
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     return re;
// }