function changeOpenStatus(productID, OpenStatus) {
    if (OpenStatus == 1) {
        if (confirm("确定修改该商品的上架状态吗？\u000d商品编号：" + productID + "上架状态将改为：下架")) {
            location.href = '/TproductListAdmin?changeProductOpenStatus=' + productID;
        }
    } else if (OpenStatus == 0) {
        if (confirm("确定修改该商品的上架状态吗？\u000d商品编号：" + productID + "上架状态将改为：上架")) {
            location.href = '/TproductListAdmin?changeProductOpenStatus=' + productID;
        }
    }
}
function siftProductList() {
    document.choiceForm.submit();
}

function closePOP_addProduct() {
    document.getElementById("coverLayer_addProduct").style.display = 'none';
    return false;
}

function showPOP_addProduct() {
    document.getElementById("coverLayer_addProduct").style.display = 'block';
}

//新增商品信息
function addForm_addProduct(){
	if(check_addForm()){
		document.add_product.submit();
	}else{
		console.log("check_addForm error, u can't submit the changePassword form.");
		return false;
	}
}

function check_addForm() {//是否为空	
    var product_name = document.forms["add_product"]["product_name"].value;
    var product_price = document.forms["add_product"]["product_price"].value;
	if (product_name == null || product_name == "") {
		alert("请输入商品名称！");
		return false;
	}else if (product_price == null || product_price == "") {
		alert("请输入商品单价！");
		return false;
	}else{
		return true;
	}
}

// function queryProductList() {
//     var productID = document.forms["choiceForm"]["productID"].value;
//     var productName = document.forms["choiceForm"]["productName"].value;
//     var corpID = document.forms["choiceForm"]["corpID"].value;
//     var productOpenStatus = document.forms["choiceForm"]["productOpenStatus"].value;
//     console.log(productID, productName, corpID, productOpenStatus);

//     const productTBody = document.getElementById("productTBody");
//     for (var i = 0; i < productTBody.rows.length; i++) { //遍历行
//         productTBody.rows[i].style.display = "";
//     }
//     // console.log(productTBody);
//     for (var i = 0; i < productTBody.rows.length; i++) { //遍历行
//         for (var j = 0; j < productTBody.rows[i].cells.length; j++) { //遍历列
//             if (j == 0 && productID != "") { //productID有值
//                 if (productTBody.rows[i].cells[j].innerHTML != productID)
//                     productTBody.rows[i].style.display = "none";
//             }
//             if (j == 1 && productName != "") { //productName有值
//                 if (productTBody.rows[i].cells[j].innerHTML != productName)
//                     productTBody.rows[i].style.display = "none";
//             }
//             if (j == 3 && corpID != "") { //corpID有值
//                 if (productTBody.rows[i].cells[j].innerHTML != corpID)
//                     productTBody.rows[i].style.display = "none";
//             }
//             if (j == 4 && productOpenStatus != 0) { //productOpenStatus有值
//                 if (productTBody.rows[i].cells[j].innerHTML != productOpenStatus)
//                     productTBody.rows[i].style.display = "none";
//             }
//         }
//     }
// }
