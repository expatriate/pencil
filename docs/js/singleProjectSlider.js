var sliderTimeout;
var singleProjectSliderContainer = $('.singleprojectslider__container'); 

var mySingleSwiper = new Swiper('.singleprojectslider__container', {
  // Optional parameters
  direction: 'horizontal',
  effect: 'fade',
  dynamicBullets: true,
  loop: false,

  autoplay: {
    delay: 10000,
    disableOnInteraction: true
  },

  pagination: {
    el: '.swiper-pagination-single',
    dynamicBullets: true,
  },

  // Navigation arrows


  on: {
    init: function () {
      var container = $('.singleprojectslider__slide-items');
      container.html('');
      var counter = $('.singleprojectslider__slide-pagination');
      var slides = '';
      $(this.slides).each(function(index, item) {
        slides += '<a class="singleprojectslider__slide-item" data-href="' + index + '">' + $(item).find('img').data('title') + '<span></span></a>';
        $(item).find('img').parent().append('<div class="singleprojectslider__descr">' + $(item).find('img').data('title') + '</div>')
      });

      container.html(slides);
      counter.text(1)

      $('.singleprojectslider__slide-item').on('click', function() {
        mySingleSwiper.slideTo($(this).data('href'))
      });

    },
    autoplay: function () {
      singleProjectSliderContainer.find('.swiper-pagination-bullet-active').text(mySingleSwiper.activeIndex + 1);
    },
    slideChange: function () {
      singleProjectSliderContainer.find('.swiper-pagination-bullet-active').text(singleProjectSliderContainer.find('.swiper-pagination-bullet-active').index() + 1);
      $('.singleprojectslider__slide-items').find('span').stop().removeClass('animatable').removeAttr('style');
      var currentSlide = $('.singleprojectslider__slide-item[data-href="'+this.activeIndex+'"]');
      var line = $(currentSlide).find('span');
      line.addClass('animatable').animate({'width': '100%'}, 10000, function() {
        $(this).removeAttr('style')
      });
      var counter = $('.singleprojectslider__slide-pagination');
      counter.text(this.activeIndex + 1)
    },
    transitionEnd: function () {
      singleProjectSliderContainer.find('.swiper-pagination-bullet-active').text(singleProjectSliderContainer.find('.swiper-pagination-bullet-active').index() + 1);
    },
    autoplayStart: function () {
      singleProjectSliderContainer.find('.swiper-pagination-bullet-active').text(singleProjectSliderContainer.find('.swiper-pagination-bullet-active').index() + 1);
      $('.singleprojectslider__slide-items').find('span').stop().removeClass('animatable').removeAttr('style');
      var currentSlide = $('.singleprojectslider__slide-item[data-href="'+this.activeIndex+'"]');
      var line = $(currentSlide).find('span');
      line.addClass('animatable').animate({'width': '100%'}, 10000, function() {
        $(this).removeAttr('style')
      })
    }
  },


});

$(window).resize(function() {
  mySingleSwiper.update();
});