// $(document).ready(function(){
// //   $("#hide").click(function(){
// //     $("p").hide();
// //   });
//   $("#银联").hide();//表示display:none;
//   $("#radio-3").click(function(){
//     $("#银联").show();
//   });
// });
function changePay(index){
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
// function changePay(index){
//     switch(index){
//         case 1:
//         alert("")
//     }
// }