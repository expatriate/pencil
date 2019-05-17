var sliderTimeout;
var mySwiper = new Swiper ('.simpleslider__container', {
  // Optional parameters
  direction: 'horizontal',
  effect: 'fade',
  dynamicBullets: true,
  loop: true,


  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    dynamicBullets: true,
  },

  autoplay: {
    delay: 10000,
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
  },

  on: {
    init: function () {
    },
    autoplay: function () {
      $('.swiper-pagination-bullet-active').text(mySwiper.activeIndex);

      var time = new Date().getTime()
      sliderTimeout = setTimeout(function() {
        console.log((new Date().getTime() - time)/ 100);
      }, 10000);
    },
    slideChange: function () {
      $('.swiper-pagination-bullet-active').text(this.activeIndex);
    },
    autoplayStart: function () {
      $('.swiper-pagination-bullet-active').text('1');

      var time = new Date().getTime()
      sliderTimeout = setTimeout(function() {
        console.log((new Date().getTime() - time)/ 100);
      }, 10000);
    }
  },


});