function deleteClearInfo(clearID) {
    if (confirm("确定删除该清算记录吗？\u000d清算号：" + clearID )) {
        location.href = '/TclearInfoAdmin?deleteClearInfo=' + clearID;
    }
}
function siftClearInfo() {
    document.choiceForm.submit();
}
