function changePay(index) {
    switch (index) {
        case 1:
            document.getElementById("微信").style.display = "";
            document.getElementById("支付宝").style.display = "none";
            document.getElementById("银联").style.display = "none";
            break;
        case 2:
            document.getElementById("微信").style.display = "none";
            document.getElementById("支付宝").style.display = "";
            document.getElementById("银联").style.display = "none";
            break;
        case 3:
            document.getElementById("微信").style.display = "none";
            document.getElementById("支付宝").style.display = "none";
            document.getElementById("银联").style.display = "";
            break;
    }
}