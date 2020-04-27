function getStudents(stuIDs) { //取ejs模板参数里的stuIDs字符串，并取出sessionStorage数据，调用creatTable函数
	console.log(stuIDs); //stuIDs998,stuIDs999
	var stuIDs = stuIDs.split(','); //字符串转数组
	for (var j in stuIDs) {
		console.log(stuIDs[j]); //输出学生网页序号
	}
	var list = [];
	for (j = 0; j < stuIDs.length; j++) {
		console.log(stuIDs[j]);
		var students = sessionStorage.getItem(stuIDs[j]);
		console.log(students);
		//获取数据后：利用JSON.parse将字符串转换成对象
		students = JSON.parse(students);
		console.log(students);
		list.push(students);
	}
	console.log("list:", list);
	creatTable(list);
}

function creatTable(list) { //遍历sessionStorage数据，创建行数据，并appendChild到表格内容
	var tbody = document.getElementById('tbMain');
	for (var i = 0; i < list.length; i++) { //遍历一下json数据            
		var trow = getDataRow(list[i]); //定义一个方法,返回tr数据     
		console.log(trow);
		tbody.appendChild(trow);
	}
}

function getDataRow(listI) { //创建行数据
	var row = document.createElement('tr'); //创建行    
	row.setAttribute('class', 'confirm'); //class="confirm"
	
	var idCell = document.createElement('td'); //创建第一列学号 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = listI.学号; //填充数据       
	row.appendChild(idCell); //加入行，下面类似   

	var nameCell = document.createElement('td'); //创建第二列学校 
	nameCell.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
	nameCell.innerHTML = listI.学校;
	row.appendChild(nameCell);

	var attr1 = document.createElement('td'); //创建第三列姓名  
	attr1.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"        
	attr1.innerHTML = listI.姓名;
	row.appendChild(attr1);

	var attr2 = document.createElement('td'); //创建院系    
	attr2.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
	attr2.innerHTML = listI.院系;
	row.appendChild(attr2);

	var attr3 = document.createElement('td'); //创建专业	 
	attr3.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	attr3.innerHTML = listI.专业;
	row.appendChild(attr3);

	var num = document.createElement('td'); //创建性别 
	num.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	num.innerHTML = listI.性别;
	row.appendChild(num);

	var price = document.createElement('td'); //创建年级   
	price.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	price.innerHTML = listI.年级;
	row.appendChild(price);

	//到这里，json中的数据已经添加到表格中，下面为每行末尾添加删除按钮              
	var delCell = document.createElement('td'); //创建第四列，操作列       
	row.appendChild(delCell);
	var btnDel = document.createElement('input'); //创建一个input控件       
	btnDel.setAttribute('type', 'button'); //type="button" 
	btnDel.setAttribute('name', 'deleteStudents'); //name="deleteStudents"     
	btnDel.setAttribute('class', 'delectButton'); //class="delectButton"       
	btnDel.setAttribute('value', '删除');
	//删除操作       
	btnDel.addEventListener('click', function () {
		// tb.removeChild(tr);})
		if (confirm("确定移除这该学号吗？")) {
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			window.sessionStorage.removeItem(listI.keysid);
			// 以下为获取已经在购物车里的商品id和学生id，若有学生id则跳转至学生确认页面
			var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
			var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
			var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
			var oldKey = Object.keys(jsonAllDataObj);
			console.log("jsonAllDataObj.keys()", oldKey, typeof (oldKey), oldKey.length);

			var oldProIDLength = 0; //统计购物车内已有的商品数量
			var oldStuIDLength = 0; //统计购物车内已有的学生学号数量

			for (var item in oldKey) {
				var itemToString = JSON.stringify(oldKey[item]);
				// console.log(item, itemToString);
				if (itemToString.indexOf("goods") != -1) {
					if (oldProIDLength + oldStuIDLength == 0) {
						keys = "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
					} else {
						keys += "&" + "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
					}
					oldProIDLength++;
				} else if (itemToString.indexOf("stuIDs") != -1) {
					if (oldProIDLength + oldStuIDLength == 0) {
						keys = "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
					} else {
						keys += "&" + "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
					}
					oldStuIDLength++;
				}
			}
			console.log(keys);
			location.href = '/TcreatOrdersInBatches_Sconfirm?' + keys;
		}
	})
	delCell.appendChild(btnDel); //把删除按钮加入td，别忘了              
	return row; //返回tr数据           
}
var data = {};
var kayName = "";
window.onload = function () { //加载完页面后，计算表格内购物车学生数量并显示；为submitData赋值，以便post
	var textDiv = document.getElementById('订单总额');
	var text = "";
	var tableBody = document.getElementById('tbMain');
	text += "缴费学生人数：" + tableBody.rows.length + "人";
	textDiv.innerHTML = text;
	// data[kayName] = tableBody.rows[i].cells[j].innerHTML;
	// console.log("arr:", data);
	// 以下为获取已经在购物车里的商品id+数量和学生id，若有商品id和学生id则跳转至设置窗口期页面
	var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
	var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
	var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
	var oldKey = Object.keys(jsonAllDataObj);
	console.log("allData:",allData);
	console.log("jsonAllData:",jsonAllData);
	console.log("jsonAllDataObj:",jsonAllDataObj);

	console.log("jsonAllDataObj.keys():", oldKey, typeof (oldKey), oldKey.length);
	for (var item in oldKey) {
		var itemToString = JSON.stringify(oldKey[item]);
		var itemKsy = itemToString.slice(1,-1); // 取到session-key
		var concent = sessionStorage.getItem(itemKsy); //取到session-value
		concent = JSON.parse(concent);
		console.log(item, itemToString,itemKsy,concent,typeof(concent) );
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
	document.submitDataForm.submit();
}