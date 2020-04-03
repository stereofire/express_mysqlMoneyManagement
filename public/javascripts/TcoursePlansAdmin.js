function deleteCoursePlan(textBookID) {
        if (confirm("提示：删除教材计划会同时删除缴费项目内该教材的信息。\u000d确定删除该教材计划吗？\u000d教材代码：" + textBookID )) {
            location.href = '/TcoursePlansAdmin?deleteCoursePlan=' + textBookID;
        }
}
function siftCoursePlans() {
    document.choiceForm.submit();
}
function closePOP_addCoursePlan() {
    document.getElementById("coverLayer_addCoursePlan").style.display = 'none';
    return false;
}

function showPOP_addCoursePlan() {
    document.getElementById("coverLayer_addCoursePlan").style.display = 'block';
}
//新增教材计划信息
function addForm_addCoursePlan(){
	if(check_addForm()){
		document.add_coursePlan.submit();
	}else{
		console.log("check_addForm error, u can't submit the changePassword form.");
		return false;
	}
}

function check_addForm() {//是否为空	
    var textBook_name = document.forms["add_coursePlan"]["textBook_name"].value;
    var coursePlan_school = document.forms["add_coursePlan"]["coursePlan_school"].value;
    var coursePlan_major = document.forms["add_coursePlan"]["coursePlan_major"].value;
    var coursePlan_term = document.forms["add_coursePlan"]["coursePlan_term"].value;
    var coursePlan_courseName = document.forms["add_coursePlan"]["coursePlan_courseName"].value;
    var coursePlan_price = document.forms["add_coursePlan"]["coursePlan_price"].value;
    var coursePlan_publishingHouse = document.forms["add_coursePlan"]["coursePlan_publishingHouse"].value;
	if (textBook_name == null || textBook_name == "") {
		alert("请输入教材名！");
		return false;
	}else if (coursePlan_school == null || coursePlan_school == "") {
		alert("请输入学院！");
		return false;
	}else if (coursePlan_major == null || coursePlan_major == "") {
		alert("请输入专业！");
		return false;
	}else if (coursePlan_courseName == null || coursePlan_courseName == "") {
		alert("请输入课程名！");
		return false;
	}else if (coursePlan_price == null || coursePlan_price == "") {
		alert("请输入教材单价！");
		return false;
	}else if (coursePlan_publishingHouse == null || coursePlan_publishingHouse == "") {
		alert("请输入出版社！");
		return false;
	}else{
		return true;
	}
}

