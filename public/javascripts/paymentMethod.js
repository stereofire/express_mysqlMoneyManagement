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
var seconds;
var SECOND = 0;
window.onload = function(){
    seconds = document.getElementById("seconds");
    SECOND = parseInt(seconds.innerHTML);
    console.log("SECOND:",SECOND);
}
function count() {
    if (SECOND == 0) {
        location.href = "/orderRecord";
    } else {
        SECOND = SECOND - 1;
    }
    var R = setTimes(SECOND);
    // console.log(R);
    document.getElementById("countDown").innerHTML = R;
};

function setTimes(value) {
    var second = parseInt(value); //秒
    var minute = 0; //分
    var hour = 0; //时
    if (second > 60) {
        minute = parseInt(second / 60); // 总分钟数
        second = parseInt(second % 60); // 除总分钟数外余下的秒数
        if (minute > 60) {
            hour = parseInt(minute / 60); // 总小时数
            minute = parseInt(minute % 60); // 除总小时数外余下的分钟数
        }
    }
    var second_y = parseInt(second); // 秒数处理
    if (second_y < 10) { // 秒数为个位数
        second_y = '0' + second_y
    }
    var results = "" + second_y; // 秒数处理完毕，就位
    if (minute > 0 || minute == 0) {
        var minute_y = parseInt(minute);
        if (minute_y < 10) {
            minute_y = '0' + minute_y;
        }
        results = "" + minute_y + ":" + results;
    }
    if (hour > 0 || hour == 0) {
        var hour_y = parseInt(hour);
        if (hour_y < 10) {
            hour_y = '0' + hour_y;
        }
        results = "" + hour_y + ":" + results;
    }
    return results;
};

window.setInterval("count()", 1000);