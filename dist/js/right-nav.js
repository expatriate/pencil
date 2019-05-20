document.addEventListener("DOMContentLoaded", rightNavInit);

function rightNavInit() {

  var container = $('#js-right-nav');
  var markup = '<div class="right-nav__wrapper">';
  $('.section').each(function(index, item) {
    if ($(item).hasClass('section__fixed')) {
      var active = ''
      if (index == 0) {
        aclass = ' active';
      }
      markup += '<a class="right-nav__item' + aclass + '" href="#' + (index + 1) + '" data-link="' + index + '"></a>';
    } else if ($(item).hasClass('section__fullsize')) {
      markup += '<a class="right-nav__item line" href="#' + (index + 1) + '" data-link="' + index + '"></a>';
    }
  });
  markup += '</div>';

  container.html(markup);
};