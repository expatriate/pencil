var sliderTimeout;
var simpleSliderContainer = $('.simpleslider__container'); 
var mySwiper = new Swiper('.simpleslider__container', {
  // Optional parameters
  direction: 'horizontal',
  effect: 'fade',
  dynamicBullets: true,
  //loop: true,


  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
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
      simpleSliderContainer.find('.swiper-pagination-bullet-active').text(mySwiper.activeIndex + 1);

      var time = new Date().getTime()
      sliderTimeout = setTimeout(function() {
        console.log((new Date().getTime() - time)/ 100);
      }, 20000);
    },
    slideChange: function () {
      simpleSliderContainer.find('.swiper-pagination-bullet-active').text(this.activeIndex + 1);
      simpleSliderContainer.find('swiper-pagination-bullet').html('');
      /*setTimeout(function() {
        $('.swiper-pagination-bullet-active').pietimer({
          timerSeconds: 10,
          color: '#234',
          fill: false,
          showPercentage: false,
          callback: function() {
            alert("yahoo, timer is done!");
            //$('#timer').pietimer('reset');
          }
        });
      }, 100)*/
    },
    autoplayStart: function () {
      simpleSliderContainer.find('.swiper-pagination-bullet-active').text('1');

      var time = new Date().getTime()
      sliderTimeout = setTimeout(function() {
        console.log((new Date().getTime() - time)/ 100);
      }, 20000);
    }
  },


});