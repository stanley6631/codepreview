import "./css/sass/main.scss";
import $ from 'jquery';
import 'slick-carousel';

window.jQuery = window.$ = $;

const fslightbox = require('fslightbox');

$(document).ready(() => {
  $('.js-menu-toggler').on('click', (e) => {
    e.preventDefault();
    $(e.currentTarget).find('.icon').toggleClass('d-none');

    let menuId = $(e.currentTarget).data('id');
    $(menuId).slideToggle('medium').toggleClass('active');

    if ($(menuId).hasClass('active')) {
      $('body').css({
        overflow: 'hidden'
      });
    } else {
      $('body').css({
        overflow: 'auto'
      });
    }
  });

  $('.js-family-houses-slider').slick({
    lazyLoad: 'ondemand',
    prevArrow: '<span class="slider-arrow slider-arrow--prev"></span>',
    nextArrow: '<span class="slider-arrow slider-arrow--next"></span>'
  });

  $(document).on('scroll', function (e) {
    if ($(document).scrollTop() > 0) {
      $('.header').addClass('scrolling');
    } else {
      $('.header').removeClass('scrolling');
    }
  });

  $('.js-scroller').on('click', function (e) {
    e.preventDefault();
    $('html, body').animate({
      scrollTop: $('#section2').offset().top
    }, 'medium');
  });

  $('.js-news-slider').slick({
    lazyLoad: 'ondemand',
    slidesToShow: 3,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dots: true,
    centerMode: true,
    centerPadding: '100px',
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          dots: false
        }
      }
    ]
  });

  $('.js-standards-accordion-slider').slick({
    lazyLoad: 'ondemand',
    fade: true,
    prevArrow: '<span class="accordion-slider-arrow accordion-slider-arrow--prev"></span>',
    nextArrow: '<span class="accordion-slider-arrow accordion-slider-arrow--next"></span>'
  });

  $('.js-standards-accordion-link').on('click', function (e) {
    e.preventDefault();
    let activeItem = $('.js-standards-accordion-link.active');

    if (!$(this).hasClass('active')) {
      activeItem.toggleClass('active');
      activeItem.next().slideToggle('medium')
      activeItem.find('.icon').toggleClass('d-none')
      activeItem.next().find('.js-standards-accordion-slider').slick('setPosition');
    }

    $(this).toggleClass('active');
    $(this).next().slideToggle('medium');
    $(this).find('.icon').toggleClass('d-none');
    $(this).next().find('.js-standards-accordion-slider').slick('setPosition');
  });

  $('.js-home-standards-tab-link').on('click', function (e) {
    e.preventDefault();

    if (!$(this).hasClass('active')) {
      $('.js-home-standards-tab-link').removeClass('active');
      $(this).addClass('active');
      let tab = $(this).attr('href');
      $('.standards-tab.show').fadeOut(300).removeClass('show').promise().done(function () {
        $(tab).fadeIn(300).addClass('show');
      });

      $('html, body').animate({
        scrollTop: $('#standardsTabs').offset().top - 76
      }, 'medium');
    }
  });

  $('.js-villa-types-slider').slick({
    lazyLoad: 'ondemand',
    prevArrow: '<span class="villa-types-arrow villa-types-arrow--prev"></span>',
    nextArrow: '<span class="villa-types-arrow villa-types-arrow--next"></span>',
  });

  $('.js-about-us-slider').slick({
    lazyLoad: 'ondemand',
    slidesToShow: 3,
    prevArrow: '<span class="slider-arrow slider-arrow--prev"></span>',
    nextArrow: '<span class="slider-arrow slider-arrow--next"></span>',
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  });

  $('.js-detail-parts-slider-nav > div').on('click', (e) => {
    e.preventDefault();
    let $dataId = $(e.currentTarget).parent().data('id');
    let $item = $(e.currentTarget);
    let $slideToGo = $item.data('slide');
    $($dataId).slick('slickGoTo', $slideToGo);
  });

  $('.js-detail-parts-slider').slick({
    fade: true,
    speed: 500,
    arrows: false,
    cssEase: 'linear',
    swipeToSlide: true
  });

  $('.js-detail-parts-slider').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
    let $dataId = $(event.currentTarget).attr('id');
    $('[data-id="#' + $dataId + '"] > div').removeClass('active');
    $('[data-id="#' + $dataId + '"] > [data-slide="' + nextSlide + '"]').addClass('active');
  });

  $('.js-switcher-link').on('click', function (e) {
    e.preventDefault();

    if (!$(this).hasClass('active')) {
      let $cardId = $(this).attr('href');

      $('.js-switcher-link').toggleClass('active');

      $('.detail-np-desc .card').fadeOut(300).removeClass('active').promise().done(function (e) {
        $($cardId).fadeIn(300);
        $($cardId).addClass('active');
      });

      $('.house-plan-img.active').fadeOut(300).promise().done(function (e) {

        $('.house-plan-img:not(.active)').fadeIn(300).addClass('active');
        $(this).removeClass('active');
      });

      $('html, body').animate({
        scrollTop: $('#npDesc').offset().top - 76
      }, 'medium');
    }
  });

  let setNpMinHeight = (e) => {
    let $npMinHeight = $('.detail-np-desc').outerHeight();
    $('.detail-np-desc').css('min-height', $npMinHeight + 'px');
  }

  setNpMinHeight();

  $(document).on('resize', function (e) {
    setNpMinHeight();
  });
});
