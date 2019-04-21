//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;


var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter;
var screenHeight = window.window.innerHeight;
var viewportBlocks;

document.addEventListener("DOMContentLoaded", ready);

function ready() {
  //console.log(window.innerWidth, window.innerHeight)

  //init();
  var particles = new Birds($('#particles-mainview')[0]);
  particles.startAnimation();
  particles.setBirdNumber(1000);


  //particlesToCenter = new Birds_moving($('#particles-subview')[0]);
  

  //animate();

  //window.addEventListener('scroll', onWindowScroll, false );

  /*var slidepage = new slidePage({
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
          //particlesToCenter.startAnimation();
          //particlesToCenter.setBirdNumber(512);
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

  window.slidepage = slidepage;*/

  initAnimationBlocks();

  initImagesHover();

  initMenuHover();

  $(function() {
    $.scrollify({
      section : '.section',
      setHeights: false,
      touchScroll: true,
      //scrollbars: false,
      standardScrollElements: true,
      //interstitialSection: '.section__fullsize',
      before: function(index, sections) {
        if (index < 6 && index >= 2) {
          var fixedtitle = $('.main-title__fixed');
          if (!fixedtitle.hasClass('animated')) {
            fixedtitle.animate({opacity: 1}, 600, function() {
              fixedtitle.addClass('animated')
            });
          }
        } else {
          var fixedtitle = $('.main-title__fixed');
          if (fixedtitle.hasClass('animated')) {
            fixedtitle.animate({opacity: 0}, 200, function() {
              fixedtitle.removeClass('animated')
            });
          }
        }
        if (index < 6) {
          

          $.scrollify.setOptions({
            //scrollbars: false
          });
          $.scrollify.update()
          //$.scrollify.disable()
        } else {
          //$.scrollify.destroy();

        }
        //$('body').find('.section:eq('+index+')').addClass('not-animated');
        var lightbox = $('body').find('.section:eq('+index+')').find('.light-box__small');
        var title = $('body').find('.section:eq('+index+')').find('.title-under');
        if (!lightbox.hasClass('animated')) {
          lightbox.animate({opacity: 0.4}, 4000, function() {
            lightbox.addClass('animated')
          });
        }
        if (!title.hasClass('animated')) {
          title.delay(1000).animate({opacity: 0.1}, 2000, function() {
            title.addClass('animated')
          });
        }
        console.log('before', index)
      },
      after: function (index, sections) {
        console.log('after', index);
        if (index == 6) {
          $.scrollify.setOptions({
            scrollbars: true
          });
          $.scrollify.update();
        }
        //startAnimation(index);
      }
    });
  });

}


/*function startAnimation(index) {
  $('body').find('.section:eq('+index+')').addClass('animated').removeClass('not-animated');
}*/
function initImagesHover() {
  var hover1 = new hoverEffect({
    parent: document.querySelector('.js-hover-1'),
    image1: $('.js-hover-1').data('first'),
    image2: $('.js-hover-1').data('second'),
    intensity: 0.2,
    speedin: 1.6,
    speedout: 1.8,
    displacementImage: 'img/distortion.png'
  });
  var hover2 = new hoverEffect({
    parent: document.querySelector('.js-hover-2'),
    image1: $('.js-hover-2').data('first'),
    image2: $('.js-hover-2').data('second'),
    intensity: 0.2,
    speedin: 1.6,
    speedout: 1.8,
    displacementImage: 'img/distortion.png'
  });
  var hover3 = new hoverEffect({
    parent: document.querySelector('.js-hover-3'),
    image1: $('.js-hover-3').data('first'),
    image2: $('.js-hover-3').data('second'),
    intensity: 0.2,
    speedin: 1.6,
    speedout: 1.8,
    displacementImage: 'img/distortion.png'
  });
  var hover4 = new hoverEffect({
    parent: document.querySelector('.js-hover-4'),
    image1: $('.js-hover-4').data('first'),
    image2: $('.js-hover-4').data('second'),
    intensity: 0.2,
    speedin: 1.6,
    speedout: 1.8,
    displacementImage: 'img/distortion.png'
  });
}

function initAnimationBlocks() {
  viewportBlocks = $('.js-viewport-block')

  viewportBlocks.viewportChecker({
    repeat: false,
    callbackFunction: function callbackFunction(elem, action) {

      console.log($(elem).find('.js-anim-image'))
      $(elem).find('.js-anim-image').each(function(index, item) {
        setTimeout(() => {
          $(item).addClass('js-anim-title-done')
        }, 300 * index);
      });

      $(elem).find('.js-anim-title, .js-anim-text, .js-anim-block').each(function(index, item) {
        setTimeout(() => {
          $(item).addClass('js-anim-title-done')
        }, 200 * index);
      });
    }
  });
}

function initMenuHover() {

  $('.top-menu__item').hover(function(e) {
    $('.top-menu__item').removeClass('hovered').addClass('nothovered');
    $(e.target).removeClass('nothovered').addClass('hovered')
  });

  $('.top-menu').hover(function(e) {
  }, function() {
    $('.top-menu__item').removeClass('hovered').removeClass('nothovered');
  });

  $('.block-footer__nav-item').hover(function(e) {
    $('.block-footer__nav-item').removeClass('hovered').addClass('nothovered');
    $(e.target).removeClass('nothovered').addClass('hovered')
  });

  $('.block-footer__nav-wrapper').hover(function(e) {
  }, function() {
    $('.block-footer__nav-item').removeClass('hovered').removeClass('nothovered');
  });

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
  //$('#stage').css({width: customHeight, height: customHeight})
}