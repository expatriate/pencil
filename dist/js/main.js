//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;


var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter;
var screenHeight = window.window.innerHeight;

document.addEventListener("DOMContentLoaded", ready);

function ready() {
  //console.log(window.innerWidth, window.innerHeight)

  //init();
  var particles = new Birds($('#particles-mainview')[0]);
  particles.startAnimation();
  particles.setBirdNumber(1500);


  particlesToCenter = new Birds_moving($('#particles-subview')[0]);
  

  //animate();

  //window.addEventListener('scroll', onWindowScroll, false );

  var slidepage = new slidePage({
      slideContainer: '.slide-container',
      slidePages: '.slide-page',
      page: 1,
      refresh: true,
      dragMode: false,

      // Events
      before: function(origin,direction,target){
        console.log(target)
        if (target == 1) {
          particles.startAnimation();
        }
        if (target == 2) {
          particlesToCenter.startAnimation();
          particlesToCenter.setBirdNumber(512);
        }
      },
      after: function(origin,direction,target){
        if (target !== 1) {
          particles.stopAnimation();
        }
        if (target == 2) {
          //particlesToCenter.stopAnimation();
        }
      },
   });

  window.slidepage = slidepage;

}

/*function onWindowScroll(e) {
  if (!scrollFlag) {
    console.log('DISABLED', e)
    e.preventDefault();
  }

  if (window.pageYOffset <= screenHeight && scrollFlag && lastScrollPos < window.pageYOffset) {

    window.scrollTo({
        top: screenHeight,
        behavior: "smooth"
    });

    scrollFlag = false;
  }

  if (window.pageYOffset <= screenHeight && scrollFlag && lastScrollPos > window.pageYOffset) {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    scrollFlag = false;
  }

  if (window.pageYOffset == screenHeight || window.pageYOffset == 0) {
    scrollFlag = true
  }
  
  lastScrollPos = window.pageYOffset
}
*/




 function onWindowResize() {

  var customHeight = $(window).height();
  var windowWidth = $(window).width();

  if (windowWidth < customHeight) {
    customHeight = windowWidth;
  }
  $('#stage').css({width: customHeight, height: customHeight})
}