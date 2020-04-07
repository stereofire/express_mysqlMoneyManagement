function deleteScholarship(scholarshipID) {
    if (confirm("确定删除该资金发放记录吗？\u000d发放编号：" + scholarshipID)) {
        location.href = '/TscholarshipInfoAdmin?deleteScholarship=' + scholarshipID;
    }
}

function closePOP_addScholarship() {
    document.getElementById("coverLayer_addScholarship").style.display = 'none';
    return false;
}

function showPOP_addScholarship() {
    document.getElementById("coverLayer_addScholarship").style.display = 'block';
}

//新增新增资金发放信息
function addForm_addScholarship(){
	if(check_addForm()){
		document.add_scholarshipInfo.submit();
	}else{
		console.log("check_addForm error, u can't submit the form.");
		return false;
	}
}

function check_addForm() {//是否为空	
    var stu_id = document.forms["add_scholarshipInfo"]["stu_id"].value;
    var scholarship_name = document.forms["add_scholarshipInfo"]["scholarship_name"].value;
    var scholarship_gread = document.forms["add_scholarshipInfo"]["scholarship_gread"].value;
    var scholarship_amount = document.forms["add_scholarshipInfo"]["scholarship_amount"].value;
    var scholarship_channel = document.forms["add_scholarshipInfo"]["scholarship_channel"].value;
	if (stu_id == null || stu_id == "") {
		alert("请输入学号！");
		return false;
	}else if (scholarship_name == null || scholarship_name == "") {
		alert("请输入名称！");
		return false;
	}else if (scholarship_gread == null || scholarship_gread == "") {
		alert("请输入等级！");
		return false;
	}else if (scholarship_amount == null || scholarship_amount == "") {
		alert("请输入金额！");
		return false;
	}else if (scholarship_channel == null || scholarship_channel == "") {
		alert("请输入发放渠道！");
		return false;
	}else{
		return true;
	}
}

function siftScholarships() {
    document.choiceForm.submit();
}


// function queryScholarshipInfo() {
//     var scholarshipID = document.forms["choiceForm"]["scholarshipID"].value;
//     var stuID = document.forms["choiceForm"]["stuID"].value;
//     var scholarshipType = document.forms["choiceForm"]["scholarshipType"].value;
//     var scholarshipName = document.forms["choiceForm"]["scholarshipName"].value;
//     var scholarshipGread = document.forms["choiceForm"]["scholarshipGread"].value;
//     console.log(scholarshipID, stuID, scholarshipType, scholarshipName, scholarshipGread);

//     const scholarshipTBody = document.getElementById("scholarshipTBody");
//     for (var i = 0; i < scholarshipTBody.rows.length; i++) { //遍历行
//         scholarshipTBody.rows[i].style.display = "";
//     }
//     // console.log(scholarshipTBody);
//     for (var i = 0; i < scholarshipTBody.rows.length; i++) { //遍历行
//         for (var j = 0; j < scholarshipTBody.rows[i].cells.length; j++) { //遍历列
//             if (j == 0 && scholarshipID != "") { //scholarshipID有值
//                 if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipID)
//                     scholarshipTBody.rows[i].style.display = "none";
//             }
//             if (j == 1 && stuID != "") { //stuID有值
//                 if (scholarshipTBody.rows[i].cells[j].innerHTML != stuID)
//                     scholarshipTBody.rows[i].style.display = "none";
//             }
//             if (j == 2 && scholarshipType != 0) { //scholarshipType有值
//                 if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipType)
//                     scholarshipTBody.rows[i].style.display = "none";
//             }
//             if (j == 3 && scholarshipName != "") { //scholarshipName有值
//                 if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipName)
//                     scholarshipTBody.rows[i].style.display = "none";
//             }
//             if (j == 4 && scholarshipGread != "") { //scholarshipGread有值
//                 if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipGread)
//                     scholarshipTBody.rows[i].style.display = "none";
//             }
//         }
//     }
// }