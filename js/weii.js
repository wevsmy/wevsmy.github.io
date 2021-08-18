// // oncontextmenu事件禁用右键菜单；
// document.oncontextmenu = function () {
//     return false;
// }
// // onselectstart事件禁用网页上选取的内容；
// document.onselectstart = function () {
//     return false;
// }
// // oncopy事件禁用复制；
// document.oncopy = function () {
//     return false;
// }
// // 禁用鼠标事件
// document.onmousedown = function (e) {
//     if (e.which === 2) {// 鼠标滚轮的按下，滚动不触发
//         return false;
//     }
//     if (e.which === 3) {// 鼠标右键
//         return false;
//     }
// }
// // 禁用键盘中的ctrl、alt、shift
// document.onkeydown = function () {
//     if (event.ctrlKey) {
//         return false;
//     }
//     if (event.altKey) {
//         return false;
//     }
//     if (event.shiftKey) {
//         return false;
//     }
// }
