function deleteScholarship(scholarshipID) {
    if (confirm("确定删除该资金发放记录吗？\u000d发放编号：" + scholarshipID)) {
        // location.href = '/TclearInfoAdmin?deleteScholarship=' + scholarshipID;
        alert("已删除资金发放记录");
    }
}

function queryScholarshipInfo() {
    var scholarshipID = document.forms["choiceForm"]["scholarshipID"].value;
    var stuID = document.forms["choiceForm"]["stuID"].value;
    var scholarshipType = document.forms["choiceForm"]["scholarshipType"].value;
    var scholarshipName = document.forms["choiceForm"]["scholarshipName"].value;
    var scholarshipGread = document.forms["choiceForm"]["scholarshipGread"].value;
    console.log(scholarshipID, stuID, scholarshipType, scholarshipName, scholarshipGread);

    const scholarshipTBody = document.getElementById("scholarshipTBody");
    for (var i = 0; i < scholarshipTBody.rows.length; i++) { //遍历行
        scholarshipTBody.rows[i].style.display = "";
    }
    // console.log(scholarshipTBody);
    for (var i = 0; i < scholarshipTBody.rows.length; i++) { //遍历行
        for (var j = 0; j < scholarshipTBody.rows[i].cells.length; j++) { //遍历列
            if (j == 0 && scholarshipID != "") { //scholarshipID有值
                if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipID)
                    scholarshipTBody.rows[i].style.display = "none";
            }
            if (j == 1 && stuID != "") { //stuID有值
                if (scholarshipTBody.rows[i].cells[j].innerHTML != stuID)
                    scholarshipTBody.rows[i].style.display = "none";
            }
            if (j == 2 && scholarshipType != 0) { //scholarshipType有值
                if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipType)
                    scholarshipTBody.rows[i].style.display = "none";
            }
            if (j == 3 && scholarshipName != "") { //scholarshipName有值
                if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipName)
                    scholarshipTBody.rows[i].style.display = "none";
            }
            if (j == 4 && scholarshipGread != "") { //scholarshipGread有值
                if (scholarshipTBody.rows[i].cells[j].innerHTML != scholarshipGread)
                    scholarshipTBody.rows[i].style.display = "none";
            }
        }
    }
}