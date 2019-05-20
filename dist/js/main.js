//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;



var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter, direction = 0, lastIndex = 0;
var screenHeight = window.window.innerHeight;
var viewportBlocks;


document.addEventListener("DOMContentLoaded", mainReady);

function mainReady() {

  var width = window.innerWidth;

  initAnimationBlocks();

  if (width > 1024) {

    initImagesHover();

    if (isNotMsie()) {
      particles = new Birds($('#particles-mainview')[0]);
      particles.startAnimation();
      particles.setBirdNumber(728);
    }

    $.scrollify({
      section : '.section',
      setHeights: false,
      touchScroll: true,
      scrollSpeed: 1100,
      //overflowScroll: false,
      //scrollbars: false,

      //scrollbars: false,
      easing: "easeOutExpo",
      standardScrollElements: true,
      //interstitialSection: '.section__fullsize',
      before: function(index, sections) {

        if (lastIndex > index) {
          direction = -1
        } else {
          direction = 1
        }
        lastIndex = index;

        // переход
        // движение вниз
        if (direction > 0) {
          $(sections[index - 1]).addClass('fading');
        }
        // движение вверх
        if (direction < 0) {
          $(sections[index + 1]).addClass('fading');
        }

        // возвращаем анимированные элементы в начальное положение
        $(sections[index]).find('.js-anim-done').removeClass('js-anim-done');
        $(sections[index]).find('.title-under').removeAttr('style').removeClass('animated');
        $(sections[index]).find('.light-box__small, .light-box').removeAttr('style').removeClass('animated');


        // анимируем проявление фиксированного заголовка
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


        // анимируем проявление элементов
        var lightbox = $('body').find('.section:eq('+index+')').find('.light-box__small, .light-box');
        var title = $('body').find('.section:eq('+index+')').find('.title-under');

        if (!lightbox.hasClass('animated')) {
          lightbox.animate({opacity: 0.4}, 4000, function() {
            lightbox.addClass('animated')
          });
        }
        if (!title.hasClass('animated')) {
          title.delay(1000).animate({opacity: 0.06}, 2000, function() {
            title.addClass('animated')
          });
        }

        // анимируем правое меню
        if (!$('.right-nav').hasClass('visible') && index > 0) {
          $('.right-nav').addClass('visible').animate({'opacity': 1}, 500);
        } else if (index == 0){
          $('.right-nav').removeClass('visible').animate({'opacity': 0}, 500);
        }
        $('.right-nav').find('.right-nav__item').removeClass('active');
        $($('.right-nav').find('.right-nav__item')[index]).addClass('active');

      },
      after: function (index, sections) {

        // убираем анимированный элемент 
        $('.fading').removeClass('fading');

        if (index >= 2) {
          particles.stopAnimation();
        } else if (!particles.playing){
          particles.startAnimation();
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
}

function initImagesHover() {
  if (document.querySelector('.js-hover-1')) {
    var hover1 = new hoverEffect({
      parent: document.querySelector('.js-hover-1'),
      image1: $('.js-hover-1').data('first'),
      image2: $('.js-hover-1').data('second'),
      intensity: 0.2,
      speedin: 1.6,
      speedout: 1.8,
      displacementImage: 'img/distortion.png'
    });
  }
  if (document.querySelector('.js-hover-2')) {
    var hover2 = new hoverEffect({
      parent: document.querySelector('.js-hover-2'),
      image1: $('.js-hover-2').data('first'),
      image2: $('.js-hover-2').data('second'),
      intensity: 0.2,
      speedin: 1.6,
      speedout: 1.8,
      displacementImage: 'img/distortion.png'
    });
  }
  if (document.querySelector('.js-hover-3')) {
    var hover3 = new hoverEffect({
      parent: document.querySelector('.js-hover-3'),
      image1: $('.js-hover-3').data('first'),
      image2: $('.js-hover-3').data('second'),
      intensity: 0.2,
      speedin: 1.6,
      speedout: 1.8,
      displacementImage: 'img/distortion.png'
    });
  }
  if (document.querySelector('.js-hover-4')) {
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
}

function initAnimationBlocks() {
  viewportBlocks = $('.js-viewport-block');

  viewportBlocks.viewportChecker({
    repeat: true,
    callbackFunction: function callbackFunction(elem, action) {
      var timeout = $(elem).data('timeout') || 0;
      if (window.innerWidth <= 1024) {
        timeout = 0;
      }
      setTimeout(function() {
        //console.log($(elem).find('.js-anim-image'))
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
      }, timeout)
    }
  });
}