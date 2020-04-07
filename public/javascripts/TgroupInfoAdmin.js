function changeGroupOpenStatus(groupID, OpenStatus) {
    if (OpenStatus == 1) {
        if (confirm("确定修改该商户集团的启用状态吗？\u000d集团编号：" + groupID + "启用状态将改为：禁用")) {
            location.href = '/TgroupInfoAdmin?changeGroupOpenStatus=' + groupID;
        }
    } else if (OpenStatus == 0) {
        if (confirm("确定修改该商户集团的启用状态吗？\u000d集团编号：" + groupID + "启用状态将改为：启用")) {
            location.href = '/TgroupInfoAdmin?changeGroupOpenStatus=' + groupID;
        }
    }
}
function siftGroupInfo() {
    document.choiceForm.submit();
}


//新增商户集团表单
function addForm(){
	if(check_addForm()){
		document.add_group.submit();
	}else{
		console.log("check_addForm error, u can't submit the changePassword form.");
		return false;
	}
}

function check_addForm() {//是否为空	
	var group_name = document.forms["add_group"]["group_name"].value;
	if (group_name == null || group_name == "") {
		alert("请输入商户集团名称！");
		return false;
	}else{
		return true;
	}
}
// function queryGroupInfo() {
//     var groupID = document.forms["choiceForm"]["groupID"].value;
//     var groupName = document.forms["choiceForm"]["groupName"].value;
//     var groupOpenStatus = document.forms["choiceForm"]["groupOpenStatus"].value;
//     console.log(groupID, groupName, groupOpenStatus);

//     const groupTBody = document.getElementById("groupTBody");
//     for (var i = 0; i < groupTBody.rows.length; i++) { //遍历行
//         groupTBody.rows[i].style.display = "";
//     }
//     console.log(groupTBody);
//     for (var i = 0; i < groupTBody.rows.length; i++) { //遍历行
//         for (var j = 0; j < groupTBody.rows[i].cells.length; j++) { //遍历列
//             if (j == 0 && groupID != "") { //groupID有值
//                 if (groupTBody.rows[i].cells[j].innerHTML != groupID)
//                     groupTBody.rows[i].style.display = "none";
//             }
//             if (j == 1 && groupName != "") { //groupName有值
//                 if (groupTBody.rows[i].cells[j].innerHTML != groupName)
//                     groupTBody.rows[i].style.display = "none";
//             }
//             if (j == 3 && groupOpenStatus != 0) { //groupOpenStatus有值
//                 if (groupTBody.rows[i].cells[j].innerHTML != groupOpenStatus)
//                     groupTBody.rows[i].style.display = "none";
//             }
//         }
//     }
// }