function deleteOrder(orderID){
    // confirm("确定删除该选缴订单吗？");
    if(confirm("确定删除选缴订单 "+orderID+" ?")){
        // functionA();
        location.href='/orderRecord?deleteOrder=' + orderID;
        alert("已删除选缴订单："+orderID);

    }
}