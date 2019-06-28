//var renderer, scene, camera, distance, raycaster, projector;
//var container = document.getElementById('main-container');
//var distance = 400;



var scrollFlag = true, lastScrollPos = 0, particles, particlesToCenter, particlesFromCenter, direction = 0, lastIndex = 0, width = window.innerWidth, stopBeforeScroll = 0, floatSections;
var screenHeight = window.window.innerHeight;
var viewportBlocks;


document.addEventListener("DOMContentLoaded", mainReady);

function mainReady() {

  initAnimationBlocks();

  floatSections = $('.section-float').length;

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
      //overflowScroll: true,
      updateHash: false,
      standardScrollElements: true,
      easing: "easeOutExpo",
      before: function(index, sections) {

        if (lastIndex > index) {
          direction = -1
        } else {
          direction = 1
        }
        lastIndex = index;

        if (index == 0 && isNotMsie() && !particles.playing){
          particles.startAnimation();
        }

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

        // анимируем проявление фиксированного заголовка
        if (index < floatSections + 2 && index >= 2) {
          console.log(index)
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

        if (index >= 1 && isNotMsie()) {
          particles.stopAnimation();
        }

        // анимируем первый экран
        if (index == 0) {
          animateFirstBlock()
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
}

function initImagesHover() {
  if (document.querySelector('.js-hover-1')) {
    var hover1 = new hoverEffect({
      parent: document.querySelector('.js-hover-1'),
      image1: document.querySelector('.js-hover-1').dataset.first,
      image2: document.querySelector('.js-hover-1').dataset.second,
      intensity: 0.2,
      speedin: 1.6,
      speedout: 1.8,
      displacementImage: 'img/distortion.png'
    });
  }
  if (document.querySelector('.js-hover-2')) {
    var hover2 = new hoverEffect({
      parent: document.querySelector('.js-hover-2'),
      image1: document.querySelector('.js-hover-2').dataset.first,
      image2: document.querySelector('.js-hover-2').dataset.second,
      intensity: 0.2,
      speedin: 1.6,
      speedout: 1.8,
      displacementImage: 'img/distortion.png'
    });
  }
  if (document.querySelector('.js-hover-3')) {
    var hover3 = new hoverEffect({
      parent: document.querySelector('.js-hover-3'),
      image1: document.querySelector('.js-hover-3').dataset.first,
      image2: document.querySelector('.js-hover-3').dataset.second,
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

function animateBlock(el) {

  var isFixed = $(el).hasClass('section-float');
  var isFirst = $(el) == $('.section').first();
  var isSecond = $(el).hasClass('section__full');

  // анимируем проявление фиксированного заголовка
  if (isFixed) {
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
  var lightbox = $(el).find('.light-box__small, .light-box');
  var title = $(el).find('.title-under');

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
  if (!$('.right-nav').hasClass('visible') && (isFixed || isSecond) && !isFirst) {
    $('.right-nav').addClass('visible').animate({'opacity': 1}, 500);
  } else if (isFirst){
    $('.right-nav').removeClass('visible').animate({'opacity': 0}, 500);
  }
  $('.right-nav').find('.right-nav__item').removeClass('active');

  if (isFixed || isSecond) {
    $($('.right-nav').find('.right-nav__item')[$('body').find('.section').index($(el))]).addClass('active');
  }
  if (!isFirst && !isFixed) {
    $('.right-nav').find('.right-nav__item').last().addClass('active');
  }
}

function initAnimationBlocks() {
  viewportBlocks = $('.js-viewport-block');

  viewportBlocks.viewportChecker({
    offset: '10%',
    repeat: false,
    callbackFunction: function callbackFunction(elem, action) {

      if (window.pageYOffset < ($(elem).offset().top + $('.section-float.visible').height()/2)) {
        animateBlock(elem)
      }

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