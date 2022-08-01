let burger = document.querySelector('.burger');
let burgerList = document.querySelector('.burger-list');
let closeBtn = document.querySelector('.close-btn');

burger.addEventListener("click", function () {
    burgerList.style.display = "flex";
    // burgerList.style.animation = "menu-left 0.5s forwards";
    burger.style.opacity = 0;
})

closeBtn.addEventListener("click", function () {
    // burgerList.style.animation = "menu-right 0.5s forwards";
    burger.style.opacity = 1;
    burgerList.style.display = "none";
    // let menuDisplayNone = function () {
    //     burgerList.style.display = "none";
    // }
    // menuDisplayNone.setTimeout(500);
})