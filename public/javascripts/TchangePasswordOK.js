// // 禁用导航，5秒动态跳转重新登录 

function countDown() {
    //获取初始时间
    var time = document.getElementById("Time");

    //获取到id为time标签中的数字时间
    if (time.innerHTML == 0) {
        //等于0时清除计时，清除sessionstorage并跳转该指定页面
        sessionStorage.clear();//这个有用！在router里跳转logintimeout.ejs后清除是没用的！
        location.href = "/teacher";
    } else {
        time.innerHTML = time.innerHTML - 1;
    }
}
//1000毫秒调用一次
window.setInterval("countDown()", 1000);