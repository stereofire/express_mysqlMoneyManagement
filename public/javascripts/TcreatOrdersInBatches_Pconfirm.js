function getGoods(ProIDs) { //取ejs模板参数里的ProIDs字符串，并取出sessionStorage数据，调用creatTable函数
	console.log(ProIDs); //goods0,goods1
	var ProIDs = ProIDs.split(','); //字符串转数组
	for (var j in ProIDs) {
		console.log(ProIDs[j]); //输出商品网页序号
	}
	var list = [];
	for (j = 0; j < ProIDs.length; j++) {
		console.log(ProIDs[j]);
		var goods = sessionStorage.getItem(ProIDs[j]);
		console.log(goods);
		//获取数据后：利用JSON.parse将字符串转换成对象
		goods = JSON.parse(goods);
		console.log(goods);
		list.push(goods);
	}
	// console.log("list:", list);
	creatTable(list);
}

function creatTable(list) { //遍历sessionStorage数据，创建行数据，并appendChild到表格内容
	console.log("list:", list);
	var tbody = document.getElementById('tbMain');
	for (var i = 0; i < list.length; i++) { //遍历一下json数据            
		// var trow = getDataRow(list[i]); //定义一个方法,返回tr数据  
		// (function (i) {
		var trow = getDataRow(list[i]); //定义一个方法,返回tr数据     
		console.log(trow);
		tbody.appendChild(trow);
		// 	var listI = list[i];
		// 	var row = document.createElement('tr'); //创建行    
		// 	row.setAttribute('class', 'confirm'); //class="confirm"
		// 	var idCell = document.createElement('td'); //创建第一列商品编号 
		// 	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
		// 	idCell.innerHTML = listI.商品编号; //填充数据       
		// 	row.appendChild(idCell); //加入行，下面类似   

		// 	var nameCell = document.createElement('td'); //创建第二列商品名称 
		// 	nameCell.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
		// 	nameCell.innerHTML = listI.商品名称;
		// 	row.appendChild(nameCell);

		// 	var attr1 = document.createElement('td'); //创建第三列属性1  
		// 	attr1.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"        
		// 	attr1.innerHTML = listI.属性1;
		// 	row.appendChild(attr1);

		// 	var attr2 = document.createElement('td'); //创建属性2    
		// 	attr2.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
		// 	attr2.innerHTML = listI.属性2;
		// 	row.appendChild(attr2);

		// 	var attr3 = document.createElement('td'); //创建属性3 
		// 	attr3.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
		// 	attr3.innerHTML = listI.属性3;
		// 	row.appendChild(attr3);

		// 	var num = document.createElement('td'); //创建数量 
		// 	num.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
		// 	num.innerHTML = listI.数量;
		// 	row.appendChild(num);

		// 	var price = document.createElement('td'); //创建商品单价   
		// 	price.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
		// 	price.innerHTML = listI.商品单价;
		// 	row.appendChild(price);

		// 	var amount = document.createElement('td'); //创建总额   
		// 	amount.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
		// 	amount.innerHTML = listI.数量 * listI.商品单价;
		// 	row.appendChild(amount);

		// 	//到这里，json中的数据已经添加到表格中，下面为每行末尾添加删除按钮              
		// 	var delCell = document.createElement('td'); //创建第四列，操作列       
		// 	row.appendChild(delCell);
		// 	var btnDel = document.createElement('input'); //创建一个input控件       
		// 	btnDel.setAttribute('type', 'button'); //type="button" 
		// 	btnDel.setAttribute('name', 'deleteGoods'); //name="deleteGoods"     
		// 	btnDel.setAttribute('class', 'delectButton'); //class="delectButton"       
		// 	btnDel.setAttribute('value', '删除');
		// 	//删除操作       
		// 	btnDel.addEventListener('click', function () {
		// 		// tb.removeChild(tr);})
		// 		if (confirm("确定删除这该商品吗？")) {
		// 			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
		// 			console.log(list, i, listI);
		// 			window.sessionStorage.removeItem(listI.keysid);
		// 			// 以下为获取已经在购物车里的商品id和学生id，若有商品id则跳转至商品确认页面
		// 			var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
		// 			var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
		// 			var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
		// 			var oldKey = Object.keys(jsonAllDataObj);
		// 			console.log("jsonAllDataObj.keys()", oldKey, typeof (oldKey), oldKey.length);

		// 			var oldProIDLength = 0; //统计购物车内已有的商品数量
		// 			var oldStuIDLength = 0; //统计购物车内已有的学生学号数量

		// 			for (var item in oldKey) {
		// 				var itemToString = JSON.stringify(oldKey[item]);
		// 				// console.log(item, itemToString);
		// 				if (itemToString.indexOf("goods") != -1) {
		// 					if (oldProIDLength + oldStuIDLength == 0) {
		// 						keys = "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
		// 					} else {
		// 						keys += "&" + "ProIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
		// 					}
		// 					oldProIDLength++;
		// 				} else if (itemToString.indexOf("stuIDs") != -1) {
		// 					if (oldProIDLength + oldStuIDLength == 0) {
		// 						keys = "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
		// 					} else {
		// 						keys += "&" + "stuIDs[]=" + oldKey[oldProIDLength + oldStuIDLength];
		// 					}
		// 					oldStuIDLength++;
		// 				}
		// 			}
		// 			console.log(keys);
		// 			// location.href = '/TcreatOrdersInBatches_Pconfirm?' + keys;
		// 		}
		// 	})
		// // })(ii);
		// delCell.appendChild(btnDel); //把删除按钮加入td，别忘了  
		// tbody.appendChild(row);
	}
}

function getDataRow(listI) { //创建行数据
	var row = document.createElement('tr'); //创建行    
	row.setAttribute('class', 'confirm'); //class="confirm"
	var idCell = document.createElement('td'); //创建第一列商品编号 
	idCell.setAttribute('style', 'color:rgb(30, 72, 126);font-size:11px;'); //style="color:rgb(30, 72, 126);"        
	idCell.innerHTML = listI.商品编号; //填充数据       
	row.appendChild(idCell); //加入行，下面类似   

	var nameCell = document.createElement('td'); //创建第二列商品名称 
	nameCell.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
	nameCell.innerHTML = listI.商品名称;
	row.appendChild(nameCell);

	var attr1 = document.createElement('td'); //创建第三列属性1  
	attr1.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"        
	attr1.innerHTML = listI.属性1;
	row.appendChild(attr1);

	var attr2 = document.createElement('td'); //创建属性2    
	attr2.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
	attr2.innerHTML = listI.属性2;
	row.appendChild(attr2);

	var attr3 = document.createElement('td'); //创建属性3 
	attr3.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	attr3.innerHTML = listI.属性3;
	row.appendChild(attr3);

	var num = document.createElement('td'); //创建数量 
	num.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	num.innerHTML = listI.数量;
	row.appendChild(num);

	var price = document.createElement('td'); //创建商品单价   
	price.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"    
	price.innerHTML = listI.商品单价;
	row.appendChild(price);

	var amount = document.createElement('td'); //创建总额   
	amount.setAttribute('style', 'font-size:11px;'); // style="font-size:x-small;"   
	amount.innerHTML = listI.数量 * listI.商品单价;
	row.appendChild(amount);

	//到这里，json中的数据已经添加到表格中，下面为每行末尾添加删除按钮              
	var delCell = document.createElement('td'); //创建第四列，操作列       
	row.appendChild(delCell);
	var btnDel = document.createElement('input'); //创建一个input控件       
	btnDel.setAttribute('type', 'button'); //type="button" 
	btnDel.setAttribute('name', 'deleteGoods'); //name="deleteGoods"     
	btnDel.setAttribute('class', 'delectButton'); //class="delectButton"       
	btnDel.setAttribute('value', '删除');
	//删除操作       
	btnDel.addEventListener('click', function () {
		// tb.removeChild(tr);})
		if (confirm("确定删除这该商品吗？")) {
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			window.sessionStorage.removeItem(listI.keysid);
			// 以下为获取已经在购物车里的商品id和学生id，若有商品id则跳转至商品确认页面
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
			location.href = '/TcreatOrdersInBatches_Pconfirm?' + keys;
		}
	})
	delCell.appendChild(btnDel); //把删除按钮加入td，别忘了              
	return row; //返回tr数据           
}
var data = {};
var kayName = "";
window.onload = function () { //加载完页面后，计算表格内购物车总额并显示
	var textDiv = document.getElementById('订单总额');
	var text = "";
	var cumputerCar = 0;
	var tableBody = document.getElementById('tbMain');
	console.log(tableBody.rows.length);
	console.log(tableBody.rows[0].cells.length);
	console.log(tableBody.rows[0].cells[7].innerHTML);

	for (var i = 0; i < tableBody.rows.length; i++) { //遍历行
		for (var j = 0; j < tableBody.rows[i].cells.length; j++) { //遍历列
			if (j == 7) {
				var num = parseFloat(tableBody.rows[i].cells[j].innerHTML);
				console.log(num);
				cumputerCar += num;
			}

			if (j == 0) {
				kayName = tableBody.rows[i].cells[j].innerHTML;
			}
			if (j == 5) {
				data[kayName] = tableBody.rows[i].cells[j].innerHTML;
			}
		}
		console.log("arr:", data);
	}
	cumputerCar = cumputerCar.toFixed(2); //toFixed()方法，自带四舍五入和补零的功能
	text += "购物车总额：" + cumputerCar + "元";
	textDiv.innerHTML = text;

	var dataStr = JSON.stringify(data);
	document.getElementById("submitData").value = dataStr;
	// document.getElementsByName('submitData').value = dataStr;
	console.log("submitData:", document.getElementById("submitData").value);
}

function submitOrder() {
	document.submitDataForm.submit();
	// return false;
}