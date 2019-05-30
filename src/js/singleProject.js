var viewportBlocks, lastIndex, width = window.innerWidth, stopBeforeScroll = 0;

document.addEventListener("DOMContentLoaded", oaReady);


var floatSections;

function oaReady() {

  initAnimationBlocks();

  floatSections = $('.section-float').length;

  if (width > 1024) {

    $.scrollify({
      section : '.section',
      setHeights: false,
      touchScroll: true,
      scrollSpeed: 1100,
      overflowScroll: true,
      easing: "easeOutExpo",
      updateHash: false,
      standardScrollElements: false,
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


        if (index == 0) {
          // возвращаем анимированные элементы в начальное положение
          $(sections[0]).find('.js-anim-done').removeClass('js-anim-done');
          $(sections[0]).find('.title-under').removeAttr('style').removeClass('animated');
          $(sections[0]).find('.light-box__small, .light-box').removeAttr('style').removeClass('animated');
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

        // возвращаем анимированные элементы в начальное положение
        $(sections[0]).find('.js-anim-done').removeClass('js-anim-done');
        $(sections[0]).find('.title-under').removeAttr('style').removeClass('animated');
        $(sections[0]).find('.light-box__small, .light-box').removeAttr('style').removeClass('animated');
        if (index == 0) {
          $(sections[0]).find('.js-anim-image').each(function(index, item) {
            setTimeout(function() {
              $(item).addClass('js-anim-done')
            }, 300 * index);
          });

          $(sections[0]).find('.js-anim-title, .js-anim-text, .js-anim-block, .js-anim-flex').each(function(index, item) {
            setTimeout(function() {
              $(item).addClass('js-anim-done')
            }, 100 * index);
          });
        }
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

    stopBeforeScroll = $('body').find('.section:not(.section__fixed)').first().offset().top;
  }

  animateFirstBlock();

};

function animateFirstBlock() {

  // анимируем элементы
  $('.section').first().find('.js-anim-image').each(function(index, item) {
    setTimeout(function() {
      $(item).addClass('js-anim-done')
    }, 300 * index);
  });

  $('.section').first().find('.js-anim-title, .js-anim-text, .js-anim-block, .js-anim-flex').each(function(index, item) {
    setTimeout(function() {
      $(item).addClass('js-anim-done')
    }, 100 * index);
  });
}

function initAnimationBlocks() {
  viewportBlocks = $('.js-viewport-block');

  viewportBlocks.viewportChecker({
    offset: '5%',
    repeat: false,
    callbackFunction: function callbackFunction(elem, action) {
      var timeout = $(elem).data('timeout') || 0;
      if (window.innerWidth <= 1024) {
        timeout = 0;
      }
      setTimeout(function() {
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

      if ($(elem).find('.singleprojectslider')) {
        mySingleSwiper.autoplay.start();
      }

      if ($(elem).find('.singleprojectslider')) {
        mySimilarSwiper.autoplay.start();
      }
    }
  });
}

$(window).scroll(function(e) {
  if (width > 1024) {
    if (window.pageYOffset < stopBeforeScroll) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
});

$(window).resize(function() {
  $.scrollify.update();
});