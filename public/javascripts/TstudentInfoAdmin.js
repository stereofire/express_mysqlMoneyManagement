function changeReadStatus(stuID, readStatus) {
    if (readStatus == 1) {
        if (confirm("确定修改该生的在读状态吗？\u000d学号：" + stuID + "在读状态将改为：不在读")) {
            location.href = '/TstudentInfoAdmin?changeReadStatus=' + stuID;
        }
    } else if (readStatus == 0) {
        if (confirm("确定修改该生的在读状态吗？\u000d学号：" + stuID + "在读状态将改为：在读")) {
            location.href = '/TstudentInfoAdmin?changeReadStatus=' + stuID;
        }
    }
}

function queryStuInfo() {
    var stuID = document.forms["choiceForm"]["stuID"].value;
    var stuName = document.forms["choiceForm"]["stuName"].value;
    var stuSchool = document.forms["choiceForm"]["stuSchool"].value;
    var stuMajor = document.forms["choiceForm"]["stuMajor"].value;
    var stuSex = document.forms["choiceForm"]["stuSex"].value;
    var stuGrade = document.forms["choiceForm"]["stuGrade"].value;
    var stuReadStatus = document.forms["choiceForm"]["stuReadStatus"].value;
    console.log(stuID, stuName, stuSchool, stuMajor, stuSex, stuGrade, stuReadStatus);

    const stuTBody = document.getElementById("stuTBody");
    for (var i = 0; i < stuTBody.rows.length; i++) { //遍历行
        stuTBody.rows[i].style.display = "";
    }
    console.log(stuTBody);
    for (var i = 0; i < stuTBody.rows.length; i++) { //遍历行
        for (var j = 0; j < stuTBody.rows[i].cells.length; j++) { //遍历列
            if (j == 0 && stuID != "") { //stuID有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuID)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 2 && stuName != "") { //stuName有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuName)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 3 && stuSchool != 0) { //stuSchool有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuSchool)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 4 && stuMajor != 0) { //stuMajor有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuMajor)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 5 && stuSex != 0) { //stuSex有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuSex)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 6 && stuGrade != 0) { //stuGrade有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuGrade)
                    stuTBody.rows[i].style.display = "none";
            }
            if (j == 7 && stuReadStatus != 0) { //stuReadStatus有值
                if (stuTBody.rows[i].cells[j].innerHTML != stuReadStatus)
                    stuTBody.rows[i].style.display = "none";
            }
        }
    }
}

function closePOP_addStu() {
    document.getElementById("coverLayer_addStu").style.display = 'none';
    return false;
}

function showPOP_addStu() {
    document.getElementById("coverLayer_addStu").style.display = 'block';
}

//新增新增学生信息
function addForm_addStu(){
	if(check_addForm()){
		document.add_stu.submit();
	}else{
		console.log("check_addForm error, u can't submit the changePassword form.");
		return false;
	}
}

function check_addForm() {//是否为空	
    var stu_id = document.forms["add_stu"]["stu_id"].value;
    var stu_name = document.forms["add_stu"]["stu_name"].value;
    var stu_school = document.forms["add_stu"]["stu_school"].value;
    var stu_major = document.forms["add_stu"]["stu_major"].value;
    var stu_gread = document.forms["add_stu"]["stu_gread"].value;
	if (stu_id == null || stu_id == "") {
		alert("请输入学号！");
		return false;
	}else if (stu_name == null || stu_name == "") {
		alert("请输入学生姓名！");
		return false;
	}else if (stu_school == null || stu_school == "") {
		alert("请输入学院！");
		return false;
	}else if (stu_major == null || stu_major == "") {
		alert("请输入专业！");
		return false;
	}else if (stu_gread == null || stu_gread == "") {
		alert("请输入年级！");
		return false;
	}else{
		return true;
	}
}