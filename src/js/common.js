document.addEventListener("DOMContentLoaded", commonReady);


// Menu hover
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

// IS INTERNET EXPLORER
function isNotMsie() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

  if (msie > 0 || isIE11) {
    return false
  }
  return true;
}

function commonReady() {



  initMenuHover();
  svg4everybody();
  objectFitImages();

  // Mobile menus
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
};
