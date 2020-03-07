// $(document).ready(function(){
//     $("#i").click(function() {
//         if ($(this).is(":checked")== true) {
//            //选中触发事件
//         } else {
//            //取消选中触发事件
//         }
//     });
// });
function checkboxOnchange(checkbox){
    var checkboxID = checkbox.id;
    console.log(checkboxID);
    switch(index){
    case 1:
    document.getElementById("银联").style.display = "none";
    // $("#银联").hide();//表示display:none;
    break;
    case 2:
    document.getElementById("银联").style.display = "none";
    // $("#银联").hide();//表示display:none;
    break;
    case 3:
    document.getElementById("银联").style.display = "";
    // $("#银联").show();
    break;
    }
}