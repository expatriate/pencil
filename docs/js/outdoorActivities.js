var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter, direction = 0, lastIndex = 0;
var screenHeight = window.window.innerHeight;
var viewportBlocks;

document.addEventListener("DOMContentLoaded", ready);

function ready() {

  initAnimationBlocks();

  $(function() {

    var width = window.innerWidth;
    var lastOffset = 0;

    if (width <= 1024) {
      $('.mobile-menu').on('click', function() {
        lastOffset = window.pageYOffset;
        $('html').addClass('overflow');
        $('body').css({'position': 'fixed', 'margin-top': -lastOffset});
        $('.top-menu').addClass('opened');
        $('.mobile-menu').addClass('hidden');
      });

      $('.close').on('click', function() {
        $('html').removeClass('overflow');
        $('body').removeAttr('style');
        window.scrollTo(0, lastOffset)
        $('.top-menu').removeClass('opened');
        $('.mobile-menu').removeClass('hidden');
      });
    }

    if (width > 1024) {
  
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
          if (index < 4 && index >= 1) {
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
};

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