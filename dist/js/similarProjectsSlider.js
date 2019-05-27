var sliderTimeout;
var similarSliderContainer = $('.similarprojectsslider__container');
var mySimilarSwiper = new Swiper('.similarprojectsslider__container', {
  // Optional parameters
  direction: 'horizontal',
  dynamicBullets: true,
  slidesPerView: 'auto',
  //centeredSlides: true,
  loop: false,


  // If we need pagination
  pagination: {
    el: '.swiper-pagination-similar',
    dynamicBullets: true,
  },

  autoplay: {
    delay: 20000,
  },


  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },


  on: {
    init: function () {
    },
    autoplay: function () {
      similarSliderContainer.find('.swiper-pagination-bullet-active').text(mySimilarSwiper.activeIndex + 1);
    },
    slideChange: function () {
      similarSliderContainer.find('.swiper-pagination-bullet-active').text(similarSliderContainer.find('.swiper-pagination-bullet-active').index() + 1);
    },
    transitionEnd: function () {
      similarSliderContainer.find('.swiper-pagination-bullet-active').text(similarSliderContainer.find('.swiper-pagination-bullet-active').index() + 1);
    },
    autoplayStart: function () {
      similarSliderContainer.find('.swiper-pagination-bullet-active').text('1');
    }
  },


});