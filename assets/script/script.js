document.querySelector('header .container button').addEventListener("click", showSideMenu);

document.querySelector('.site-overlay').addEventListener("click", hideSideMenu);

function showSideMenu() {
    document.querySelector('aside').classList.add('right-transition');
    setTimeout(()=>{
        document.querySelector('.site-overlay').classList.add('overlay-bg');
    }, 200);
}

function hideSideMenu() {
    document.querySelector('aside').classList.toggle('right-transition');
}