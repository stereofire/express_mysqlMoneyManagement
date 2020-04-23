function deleteStockRecord(stockID) {
    if (confirm("确定删除该供货记录吗？\u000d采购编号：" + stockID)) {
        location.href = '/TstockListAdmin?deleteStockRecord=' + stockID;
    }
}

function siftStocks() {
    document.choiceForm.submit();
}
function closePOP_addStock() {
    document.getElementById("coverLayer_addStock").style.display = 'none';
    return false;
}

function showPOP_addStock() {
    document.getElementById("coverLayer_addStock").style.display = 'block';
}