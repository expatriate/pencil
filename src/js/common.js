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

  $('.tabs-head__item').hover(function(e) {
    $('.tabs-head__item').removeClass('hovered').addClass('nothovered');
    $(e.target).removeClass('nothovered').addClass('hovered')
  });

  $('.tabs-head').hover(function(e) {
  }, function() {
    $('.tabs-head__item').removeClass('hovered').removeClass('nothovered');
  });

}

// Tabs
$('.tabs-head__item').on('click', function() {
  $(this).parent().find('.tabs-head__item.active').removeClass('active');
  $(this).addClass('active');
  $(this).parents('.tabs').find('.tabs-content__item.active').removeClass('active');
  $(this).parents('.tabs').find('.tabs-content__item[data-item="' + this.dataset.href + '"]').addClass('active');
});

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

function fixStartMarkup() {
  
  $('.section').first().prepend($('#header'));

  $('.section').last().append($('#footer'));
}

function commonReady() {

  // Markup start
  fixStartMarkup();

  // Initials
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

  // Modal
  $(document).on('click', '.modal', function(e) {

    $('.form-text').val('');
    $('.form-text').removeClass('error');

    if (this.dataset.buttontext) {
      $(this.dataset.popup).find('.js-send-form').text(this.dataset.buttontext)
    }

    if (this.dataset.title) {
      $(this.dataset.popup).find('.js-title').text(this.dataset.title)
    }

    if (this.dataset.text) {
      $(this.dataset.popup).find('.js-text').text(this.dataset.text)
    }

    $.magnificPopup.open({
      items: {
        src: e.target.dataset.popup,
        type: 'inline',
      },
      callbacks: {
        beforeOpen: function() {
          $.scrollify.disable()
        },
        elementParse: function(item) {
          $(item).find('.form-text').val('').removeClass('error');
        },
        afterClose: function() {
          $.scrollify.enable();
          $('body').focus();
        },
      }
    });
  });

  $('.js-success').on('click', function(e) {
    $.magnificPopup.close();
  });

  $(document).on('click', '.js-send-form', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var form = $(this).parents('form')[0];
    var inputs = $(this).parents('form').find('input');
    var fd = [];
    var errors = [];

    inputs.each(function(index, item) {
      if (!item.value && item.required) {
        errors.push({
          el: item,
          message: 'Это поле обязательно для заполнения'
        })
      } else {
        fd[item.name] = item.value
      }
    });

    if (!errors.length) {
      $.ajax({
        type: 'POST',
        url: '/test.php',
        data: fd,
        cache : false,
        processData: false,
        success: function(data) {
          $.magnificPopup.close();
          $.magnificPopup.open({
            items: {
              src: '#success-popup',
              type: 'inline',
            },
          });
        },
        error: function(data) {
          $.magnificPopup.close();
        }
      })
    } else {
      for(var i = 0; i < errors.length; i++) {
        $(errors[i].el).addClass('error');
      }
    }    
  });

  $(document).on('focusin', '.form-text.error', function() {
    $(this).removeClass('error');
  });

};
