function deleteClearInfo(clearID) {
    if (confirm("确定删除该清算记录吗？\u000d清算号：" + clearID )) {
        location.href = '/TclearInfoAdmin?deleteClearInfo=' + clearID;
    }
}
function siftClearInfo() {
    document.choiceForm.submit();
}
function closePOP_updateClearInfo() {
    document.getElementById("coverLayer_updateClearInfo").style.display = 'none';
    return false;
}

function showPOP_updateClearInfo(clearID,stockID,deposit,depositStatus,remainingPayment,remainingPaymentStatus,depositPayTime,remainingPayLimit) {
    console.log(clearID,stockID,deposit,depositStatus,remainingPayment,remainingPaymentStatus,depositPayTime,remainingPayLimit);
    var update_clearID = document.getElementsByName("update_clearID")[0];
    var update_clearId = document.getElementsByName("update_clearId")[0];
    var update_stockID = document.getElementsByName("update_stockID")[0];
    var update_stockId = document.getElementsByName("update_stockId")[0];
    var update_deposit = document.getElementsByName("update_deposit")[0];
    var update_depositStatus = document.getElementsByName("update_depositStatus")[0];
    var update_remainingPayment = document.getElementsByName("update_remainingPayment")[0];
    var update_remainingPaymentStatus = document.getElementsByName("update_remainingPaymentStatus")[0];
    var update_depositPayTime = document.getElementsByName("update_depositPayTime")[0];
    var update_remainingPayLimit = document.getElementsByName("update_remainingPayLimit")[0];

    update_clearID.value = clearID;
    update_clearId.value = clearID;
    update_stockID.value = stockID;
    update_stockId.value = stockID;
    update_deposit.value = deposit;
    if(depositStatus == 1){
        update_depositStatus.value = "已支付";
    }else{
        update_depositStatus.value = "未支付";
    }
    // update_depositStatus.value = depositStatus;
    if(remainingPayment == ""){
        remainingPayment = 0;
    }
    update_remainingPayment.value = remainingPayment;
    if(remainingPaymentStatus == 1){
        update_remainingPaymentStatus.value = "已结算";
    }else{
        update_remainingPaymentStatus.value = "未结算";
    }
    // update_remainingPaymentStatus.value = remainingPaymentStatus;
    depositPayTime = depositPayTime.slice(0,10);
    console.log(depositPayTime);
    update_depositPayTime.value = depositPayTime;
    remainingPayLimit = depositPayTime.slice(0,10);
    console.log(remainingPayLimit);
    update_remainingPayLimit.value = remainingPayLimit;

    document.getElementById("coverLayer_updateClearInfo").style.display = 'block';
}
//修改清算信息
function updateForm_updateClearInfo(){
	// if(check_updateForm()){
		document.update_clearInfo.submit();
	// }else{
	// 	console.log("check_updateForm error, u can't submit the form.");
	// 	return false;
	// }
}

// function check_updateForm() {//是否为空	
//     var update_clearID = document.forms["update_clearInfo"]["update_clearID"].value;
//     var update_stockID = document.forms["update_clearInfo"]["update_stockID"].value;
//     var update_deposit = document.forms["update_clearInfo"]["update_deposit"].value;
//     var upupdate_depositStatus = document.forms["update_clearInfo"]["upupdate_depositStatus"].value;
//     var update_remainingPayment = document.forms["update_clearInfo"]["update_remainingPayment"].value;
//     var update_remainingPaymentStatus = document.forms["update_clearInfo"]["update_remainingPaymentStatus"].value;
//     var update_depositPayTime = document.forms["update_clearInfo"]["update_depositPayTime"].value;
//     var update_remainingPayLimit = document.forms["update_clearInfo"]["update_remainingPayLimit"].value;
// 	if (update_clearID == null || update_clearID == "") {
// 		alert("请输入教材名！");
// 		return false;
// 	}else if (update_stockID == null || update_stockID == "") {
// 		alert("请输入学院！");
// 		return false;
// 	}else if (update_deposit == null || update_deposit == "") {
// 		alert("请输入专业！");
// 		return false;
// 	}else if (update_remainingPayment == null || update_remainingPayment == "") {
// 		alert("请输入课程名！");
// 		return false;
// 	}else if (update_remainingPaymentStatus == null || update_remainingPaymentStatus == "") {
// 		alert("请输入教材单价！");
// 		return false;
// 	}else if (update_depositPayTime == null || update_depositPayTime == "") {
// 		alert("请输入出版社！");
// 		return false;
// 	}else{
// 		return true;
// 	}
// }
