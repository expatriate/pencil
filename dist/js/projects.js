var viewportBlocks, lastIndex, width = window.innerWidth;

document.addEventListener("DOMContentLoaded", onProjectsReady);


function onProjectsReady() {

  initAnimationBlocks();
};

function initAnimationBlocks() {
  viewportBlocks = $('.js-viewport-block');

  // first block
  $('.js-viewport-block-first').find('.js-anim-title, .js-anim-text, .js-anim-block, .js-anim-flex').each(function(index, item) {
    setTimeout(function() {
      $(item).addClass('js-anim-done')
    }, 100 * index);
  });
  // анимируем проявление элементов
  var lightbox = $('body').find('.light-box__small, .light-box');

  if (!lightbox.hasClass('animated')) {
    lightbox.animate({opacity: 0.4}, 4000, function() {
      lightbox.addClass('animated')
    });
  }

  viewportBlocks.viewportChecker({
    offset: '10%',
    repeat: false,
    callbackFunction: function callbackFunction(elem, action) {
      console.log(elem)
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