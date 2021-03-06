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
    $('body').addClass('ie');
    return false
  }
  return true;
}

function fixStartMarkup() {
  
  $('.section').first().prepend($('#header'));

  $('.section').last().append($('#footer'));
}

function commonReady() {

  isNotMsie();

  // Markup start
  fixStartMarkup();

  // Initials
  initMenuHover();
  svg4everybody();
  objectFitImages();
  initTippy();

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

    var trigger = this;
    if (!trigger.dataset.popup) {
      trigger = $(trigger).parents('.modal')[0];
    }

    if (trigger.dataset.img) {
      $('#js-docs-img').attr('src', trigger.dataset.img);

      $('#js-docs-container').trigger('zoom.destroy');
      $('#js-docs-container').zoom({url: trigger.dataset.img, on:'mouseover' });
    }

    $('.form-text').val('');
    $('.form-text').removeClass('error');

    if (trigger.dataset.buttontext) {
      $(trigger.dataset.popup).find('.js-send-form').text(trigger.dataset.buttontext)
    }

    if (trigger.dataset.title) {
      $(trigger.dataset.popup).find('.js-title').text(trigger.dataset.title)
    }

    if (trigger.dataset.text) {
      $(trigger.dataset.popup).find('.js-text').text(trigger.dataset.text)
    }

    $.magnificPopup.open({
      items: {
        src: trigger.dataset.popup,
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
    var fd = {
      phone: '',
      email: '',
      page: ''
    }
    var errors = [];

    inputs.each(function(index, item) {
      if (!item.value && item.required) {
        errors.push({
          el: item,
          message: 'Это поле обязательно для заполнения'
        });
      } else {
        if (item.name === 'phone') {
          /*var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]?[-\s\.]?[0-9]{2}?[-\s\.]?[0-9]{2}$/im;
          if (!re.test(String(item.value).toLowerCase())) {
              errors.push({
                el: item,
                message: 'Некорректный номер телефона'
              });
          }*/
          if (!item.value || item.value.length < 10) {
            errors.push({
              el: item,
              message: 'Некорректный номер телефона'
            });
          }
          fd.phone = item.value
        }
        if (item.name === 'email') {
          var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Zа-яА-ЯёЁ\-0-9]+\.)+[a-zA-Zа-яА-ЯёЁ]{2,}))$/;
          if (!re.test(String(item.value).toLowerCase())) {
              errors.push({
                el: item,
                message: 'Некорректный адрес'
              });
          }
          fd.email = item.value
        }
        if (item.name === 'page') {
          fd.page = item.value
        }
      }
    });

    if (!errors.length) {
      $.ajax({
        type: 'POST',
        url: form.dataset.place || '',
        data: {
          phone: fd.phone,
          email: fd.email,
          page: fd.page
        },
        cache : false,
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





  $('input[name=phone]').each(function(index, item) {
    var maskOptions = {
      mask: '+{7}(000)000-00-00'
    };
    var mask = IMask(item, maskOptions);
  })


  // PRODUCTION
  if ($('#production').length) {
    $('body').addClass('dark-theme');
  }

};


function initTippy() {

  var imgsTippy = $('#project-award-js').data('img');
  var tippyHtml = '';

  if (imgsTippy) {
    var tippyImgs = imgsTippy.split(',')
    for (var i = 0; i < tippyImgs.length; i++) {
      tippyHtml += '<img src="' + tippyImgs[i].replace(/\s/g, '') + '"></img>';
    }
    tippy('#project-award-js', {
      content: '<div class="single-icon__award-list">' + tippyHtml + '</div>',
    });
  }
}