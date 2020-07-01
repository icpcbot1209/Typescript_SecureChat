"use strict";
var TutorialPoint;
(function (TutorialPoint) {
    function add(x, y) { console.log(x + y); }
    TutorialPoint.add = add;
})(TutorialPoint || (TutorialPoint = {}));
document.addEventListener('DOMContentLoaded', function (_event) {
    TutorialPoint.add(10, 2);
});
