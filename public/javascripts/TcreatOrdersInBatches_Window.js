var stuNum = 0;
function getData(stuIDs, proIDs, proNum) {
	console.log(stuIDs); //stuIDs998,stuIDs999
	var stuIDs = stuIDs.split(','); //字符串转数组
	var proIDs = proIDs.split(','); //字符串转数组
	var proNum = proNum.split(','); //字符串转数组
	console.log(stuIDs); //stuIDs998,stuIDs999
	console.log(proIDs);
	console.log(proNum);

	var tbody = document.getElementsByName('sum_confirmTB')[0];
	var stuIDstr = "";
	var proIDstr = "";
	var proNumstr = "";
	for (var i in stuIDs) {
		if (i == 0) {
			stuIDstr += stuIDs[i];
		} else {
			stuIDstr += "\n" + stuIDs[i];
		}
		stuNum++;
	}
	for (var j in proIDs) {
		if (j == 0) {
			proIDstr += proIDs[j];
			proNumstr += proNum[j];
		} else {
			proIDstr += "\n" + proIDs[j];
			proNumstr += "\n" + proNum[j];
		}
	}
	console.log("stuIDstr:", stuIDstr);
	console.log("proIDstr:", proIDstr);
	console.log("proNumstr:", proNumstr);


	var row = document.createElement('tr'); //创建行 

	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell1 = document.createElement('td'); //创建第一列学号 
	idCell1.setAttribute('style', 'color:black;font-size:11px;');//background-color:rgb(235, 246, 255);'); //style="color:rgb(30, 72, 126);"        
	idCell1.innerHTML = stuIDstr; //填充数据
	row.appendChild(idCell1);

	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell2 = document.createElement('td'); //创建第二列商品编号 
	idCell2.setAttribute('style', 'color:black;font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell2.innerHTML = proIDstr; //填充数据
	row.appendChild(idCell2);

	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell3 = document.createElement('td'); //创建第三列商品数量 
	idCell3.setAttribute('style', 'color:black;font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell3.innerHTML = proNumstr; //填充数据
	row.appendChild(idCell3);

	tbody.appendChild(row);
}
var data = {};
window.onload = function () { //加载完页面后，计算表格内购物车学生数量并显示；为submitData赋值，以便post
	var textDiv = document.getElementsByName('人数')[0];
	var text = "";
	text += "缴费学生总人数：" + stuNum + "人";
	textDiv.innerHTML = text;
	// console.log("arr:", data);
	// 以下为获取已经在购物车里的商品id+数量和学生id，若有商品id和学生id则跳转至设置窗口期页面
	var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
	var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
	var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
	var oldKey = Object.keys(jsonAllDataObj);
	console.log("allData:", allData);
	console.log("jsonAllData:", jsonAllData);
	console.log("jsonAllDataObj:", jsonAllDataObj);

	console.log("jsonAllDataObj.keys():", oldKey, typeof (oldKey), oldKey.length);
	for (var item in oldKey) {
		var itemToString = JSON.stringify(oldKey[item]);
		var itemKsy = itemToString.slice(1, -1); // 取到session-key
		var concent = sessionStorage.getItem(itemKsy); //取到session-value
		concent = JSON.parse(concent);
		console.log(item, itemToString, itemKsy, concent, typeof (concent));
		if (itemToString.indexOf("goods") != -1) {
			console.log(concent.商品编号);
			data[concent.商品编号] = concent.数量;
		} else if (itemToString.indexOf("stuIDs") != -1) {
			console.log(concent.学号);
			data[concent.学号] = "true";
		}
	}
	var dataStr = JSON.stringify(data);
	document.getElementById("submitData").value = dataStr;
	console.log("submitData:", document.getElementById("submitData").value);
}

function submitOrder() {
	var date = document.getElementById("txtDate").value; //2020-04-18 string

	if (date == "") {
		alert("还未选择缴费期限哦");
	} else {
		var now = new Date();
		console.log(date, now);
		now = dateFormat("YYYY-mm-dd  HH:MM:SS", now); // 2020-04-09 string
		console.log(date, now);
		// 转为date数据类型
		date = new Date(date);
		now = new Date(now);
		// 时间差
		var num = date.getTime() - now.getTime();
		console.log(date, now, num);
		num = num / 1000 / 60 / 60 / 24; //这是换算天数，求时分秒什么的，依次减少一个来除便行了
		if (num < 0) {
			alert("缴费期限必须在明日（含）及以后");
		} else {
			document.submitDataForm.submit();
		}
	}
}

function dateFormat(fmt, date) {
	let ret;
	const opt = {
		"Y+": date.getFullYear().toString(), // 年
		"m+": (date.getMonth() + 1).toString(), // 月
		"d+": date.getDate().toString(), // 日
		"H+": date.getHours().toString(), // 时
		"M+": date.getMinutes().toString(), // 分
		"S+": date.getSeconds().toString() // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
		};
	};
	return fmt;
}

function getStudents(stuIDs) { //取ejs模板参数里的stuIDs字符串，并取出sessionStorage数据，调用creatTable函数
	console.log(stuIDs); //stuIDs998,stuIDs999
	var stuIDs = stuIDs.split(','); //字符串转数组
	for (var j in stuIDs) {
		console.log(stuIDs[j]); //输出学生网页序号
	}
	var list = [];
	for (j = 0; j < stuIDs.length; j++) {
		console.log(stuIDs[j]);
		var students = stuIDs[j];
		console.log(students);
		// //获取数据后：利用JSON.parse将字符串转换成对象
		// students = JSON.parse(students);
		// console.log(students);
		list.push(students);
	}
	console.log("list:", list);
	creatTable(list);
}

function creatTable(list) { //遍历sessionStorage数据，创建行数据，并appendChild到表格内容
	var tbody = document.getElementsByName('stu_tbMain')[0];
	for (var i = 0; i < list.length; i++) { //遍历一下json数据            
		var trow = getDataRow(list[i], i); //定义一个方法,返回tr数据     
		console.log(trow);
		tbody.appendChild(trow);
	}
}

function getDataRow(listI, i) { //创建行数据
	var row = document.createElement('tr'); //创建行 

	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell = document.createElement('td'); //创建第一列序号 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = i + 1; //填充数据
	row.appendChild(idCell);

	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell = document.createElement('td'); //创建第二列学号 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = listI; //填充数据       
	row.appendChild(idCell); //加入行  
	return row; //返回tr数据           
}

function getProducts(proIDs, proNum) { //取ejs模板参数里的proIDs字符串，并取出sessionStorage数据，调用PcreatTable函数
	console.log(proIDs, proNum); //S000283,S000284  1,1
	var proIDs = proIDs.split(','); //字符串转数组
	var proNum = proNum.split(','); //字符串转数组
	for (var j in proIDs) {
		console.log(proIDs[j], proNum[j]); //输出商品编号+数量
	}
	// var list = [];
	// for (j = 0; j < proIDs.length; j++) {
	// 	console.log(proIDs[j]);
	// 	var products = proIDs[j];
	// 	console.log(products);
	// 	// //获取数据后：利用JSON.parse将字符串转换成对象
	// 	// products = JSON.parse(products);
	// 	// console.log(products);
	// 	list.push(products);
	// }
	PcreatTable(proIDs, proNum);
}

function PcreatTable(proIDs, proNum) { //遍历sessionStorage数据，创建行数据，并appendChild到表格内容
	var tbody = document.getElementsByName('pro_tbMain')[0];
	for (var i = 0; i < proIDs.length; i++) { //遍历一下json数据            
		var trow = PgetDataRow(proIDs[i], proNum[i]); //定义一个方法,返回tr数据     
		console.log(trow);
		tbody.appendChild(trow);
	}
}

function PgetDataRow(proIDstI, proNumI) { //创建行数据
	var row = document.createElement('tr'); //创建行    
	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell = document.createElement('td'); //创建第一列商品编号 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = proIDstI; //填充数据       
	row.appendChild(idCell); //加入行  

	var idCell = document.createElement('td'); //创建第2列商品数量 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = proNumI; //填充数据       
	row.appendChild(idCell); //加入行  
	return row; //返回tr数据           
}