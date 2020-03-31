function deleteCoursePlan(textBookID) {
        if (confirm("确定删除该教材计划吗？\u000d教材代码：" + textBookID )) {
            // location.href = '/TcoursePlansAdmin?deleteCoursePlan=' + textBookID;
            alert("已删除教材计划");
        }
}

function queryCoursePlans() {
    var textBookID = document.forms["choiceForm"]["textBookID"].value;
    var school = document.forms["choiceForm"]["school"].value;
    var textBookprice = document.forms["choiceForm"]["textBookprice"].value;
    var major = document.forms["choiceForm"]["major"].value;
    var schoolTerm = document.forms["choiceForm"]["schoolTerm"].value;
    var courseName = document.forms["choiceForm"]["courseName"].value;
    var textBookName = document.forms["choiceForm"]["textBookName"].value;
    var publishingHouse = document.forms["choiceForm"]["publishingHouse"].value;
    console.log(textBookID, school, textBookprice,major, schoolTerm,courseName,textBookName,publishingHouse);

    const coursePlanTBody = document.getElementById("coursePlanTBody");
    for (var i = 0; i < coursePlanTBody.rows.length; i++) { //遍历行
        coursePlanTBody.rows[i].style.display = "";
    }
    console.log(coursePlanTBody);
    for (var i = 0; i < coursePlanTBody.rows.length; i++) { //遍历行
        for (var j = 0; j < coursePlanTBody.rows[i].cells.length; j++) { //遍历列
            if (j == 0 && textBookID != "") { //textBookID有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != textBookID)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 1 && textBookName != "") { //textBookName有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != textBookName)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 2 && school != "") { //school有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != school)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 3 && major != "") { //major有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != major)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 4 && schoolTerm != 0) { //schoolTerm有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != schoolTerm)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 5 && courseName != "") { //courseName有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != courseName)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 6 && textBookprice != "") { //textBookprice有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != textBookprice)
                    coursePlanTBody.rows[i].style.display = "none";
            }
            if (j == 7 && publishingHouse != "") { //publishingHouse有值
                if (coursePlanTBody.rows[i].cells[j].innerHTML != publishingHouse)
                    coursePlanTBody.rows[i].style.display = "none";
            }
        }
    }
}