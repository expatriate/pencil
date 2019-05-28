var sliderTimeout;
var imgsaladSliderContainer = $('.imgsalad');
var myImgsaladSwiper;

function initSliderImgsalad() {
  myImgsaladSwiper = new Swiper('.imgsalad', {
    // Optional parameters
    direction: 'horizontal',
    slidesPerView: 'auto',

    //centeredSlides: true,
    loop: false,


    // If we need pagination
    pagination: {
      el: '.swiper-pagination-imgsalad',
      dynamicBullets: true,
      renderBullet: function (index, className) {
        return '<div class="' + className + '">' + (index + 1) + '</div>';
      },
    },


    autoplay: {
      delay: 10000,
    },


    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },


    on: {
      init: function () {
      },
    },

  });
}

document.addEventListener("DOMContentLoaded", mainReady);

function shouldSliderAppear() {
  if (window.innerWidth < 1024) {
    return true;
  } else {
    return false;
  }
}
function mainReady() {
  if (shouldSliderAppear()) {
    initSliderImgsalad();
    console.log(myImgsaladSwiper)
  }
}

$(window).resize(function() {
  if (shouldSliderAppear()) {
    if (!myImgsaladSwiper || !myImgsaladSwiper.initialized) {
      initSliderImgsalad();
    }
  } else {
    myImgsaladSwiper.destroy(true, true)
  }
});