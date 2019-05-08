//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;

function isNotMsie() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

  if (msie > 0 || isIE11) {
    console.log(false)
    return false
  }
  console.log(true)
  return true;
}

if (isNotMsie()) {
  /*if (!('createImageBitmap' in window)) {
    window.createImageBitmap = async function (data) {
      return new Promise((resolve,reject) => {
        let dataURL;
        if (data instanceof Blob) {
          dataURL = URL.createObjectURL(data);
        } else if (data instanceof ImageData) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = data.width;
          canvas.height = data.height;
          ctx.putImageData(data,0,0);
          dataURL = canvas.toDataURL();
        } else {
          throw new Error('createImageBitmap does not handle the provided image source type');
        }
        const img = document.createElement('img');
        img.addEventListener('load',function () {
          resolve(this);
        });
        img.src = dataURL;
      });
    };
  }*/


}

var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter;
var screenHeight = window.window.innerHeight;
var viewportBlocks;


document.addEventListener("DOMContentLoaded", ready);

function ready() {

  initAnimationBlocks();

  initMenuHover();

  svg4everybody();

  $(function() {

    let width = window.innerWidth;

    if (width <= 1024) {
      $('.mobile-menu').on('click', function() {
        $('html').addClass('overflow');
        $('.top-menu').addClass('opened');
        $('.mobile-menu').addClass('hidden');
      });

      $('.close').on('click', function() {
        $('html').removeClass('overflow');
        $('.top-menu').removeClass('opened');
        $('.mobile-menu').removeClass('hidden');
      });
    }

    if (width > 768) {

      initImagesHover();

      if (isNotMsie()) {
        var particles = new Birds($('#particles-mainview')[0]);
        particles.startAnimation();
        particles.setBirdNumber(728);
      }
  
      $.scrollify({
        section : '.section',
        setHeights: false,
        touchScroll: true,
        //scrollbars: false,
        standardScrollElements: true,
        //interstitialSection: '.section__fullsize',
        before: function(index, sections) {

          $('.right-nav').find('.right-nav__item').removeClass('active');
          $($('.right-nav').find('.right-nav__item')[index]).addClass('active');


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
            title.delay(1000).animate({opacity: 0.02}, 2000, function() {
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


      $('.right-nav__item').on('click', function(e) {
        e.preventDefault();
        $.scrollify.move($(this).data('link'));
      });

      $('.backtoptop').on('click', function(e) {
        e.preventDefault();
        $.scrollify.move($(this).data('link'));
      });
    }

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
        setTimeout(function() {
          $(item).addClass('js-anim-done')
        }, 300 * index);
      });

      $(elem).find('.js-anim-title, .js-anim-text, .js-anim-block, .js-anim-flex').each(function(index, item) {
        setTimeout(function() {
          $(item).addClass('js-anim-done')
        }, 100 * index);
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