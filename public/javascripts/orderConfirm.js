function getGoods(keys) { //取ejs模板参数里的keys字符串，并取出sessionStorage数据，调用creatTable函数
	console.log(keys); //goods0,goods1
	var keys = keys.split(','); //字符串转数组
	for (var j in keys) {
		console.log(keys[j]); //输出商品网页序号
	}
	var list = [];
	for (j = 0; j < keys.length; j++) {
		console.log(keys[j]);
		var goods = sessionStorage.getItem(keys[j]);
		console.log(goods);
		//获取数据后：利用JSON.parse将字符串转换成对象
		goods = JSON.parse(goods);
		console.log(goods);
		list.push(goods);
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
	var idCell = document.createElement('td'); //创建第一列商品编号 
	idCell.setAttribute('style', 'color:lightsteelblue;font-size:11px;'); //style="color:lightsteelblue;"        
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
	btnDel.setAttribute('name', 'delectGoods'); //name="delectGoods"     
	btnDel.setAttribute('class', 'delectButton'); //class="delectButton"       
	btnDel.setAttribute('value', '删除');
	//删除操作       
	btnDel.addEventListener('click', function () {
		// tb.removeChild(tr);})
		if (confirm("确定删除这该商品吗？")) {
			this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
			window.sessionStorage.removeItem(listI.keysid);
			// 以下为获取已经在购物车里的商品id
			var allData = sessionStorage.valueOf(); //获得所有sessionStorage数据，为一个普通js对象
			// console.log(allData);
			// console.log(typeof (allData));
			var jsonAllData = JSON.stringify(allData); //普通object转换为JSON字符串
			var jsonAllDataObj = JSON.parse(jsonAllData); //由JSON字符串转换为JSON对象
			// console.log(jsonAllDataObj);
			// console.log(typeof (jsonAllDataObj));
			var oldKey = Object.keys(jsonAllDataObj);
			console.log("jsonAllDataObj.keys()", oldKey);
			var oldKeyLength = 0;
			for (var item in oldKey) {
				oldKeyLength++;
			}
			console.log("oldKeyLength:", oldKeyLength);
			for (var j = 0; j < oldKeyLength; j++) {
				if (j == 0) {
					keys = "keys[]=" + oldKey[j];
				} else {
					keys += "&" + "keys[]=" + oldKey[j];
				}
				console.log(keys);
			}
			location.href = '/orderConfirm?' + keys;
		}
	})
	delCell.appendChild(btnDel); //把删除按钮加入td，别忘了              
	return row; //返回tr数据           
}

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
				cumputerCar += num;
			}
		}
	}
	text += "购物车总额：" + cumputerCar + "元";
	textDiv.innerHTML = text;
}

function submitOrder() {
	var tbody = document.getElementById('tbMain');
	for (var i = 0; i < tbody.rows.length; i++) { //遍历行
		for (var j = 0; j < tbody.rows[i].cells.length; j++) { //遍历列
			// if (j == 7) {
			// 	var num = parseFloat(tbody.rows[i].cells[j].innerHTML);
			// 	cumputerCar += num;
			// }
		}
	}
}