// Replacer theme 2.0.0
// --------------------


// Smooth scroll for links
var scroll = new SmoothScroll('a[href*="#"]');


// Navbar styles switcher for scrolled navbar
function scrolled_navbar() {
    var scroll = window.scrollY;
    if (scroll > 0) {
        $(".navbar-dark").addClass("navbar-light");
        $(".navbar-dark").addClass("navbar-dark-scrolled");
        $(".navbar-dark-scrolled").removeClass("navbar-dark");
        $(".navbar").addClass("navbar-light-scrolled");
    } else {
        $(".navbar-dark-scrolled").removeClass("navbar-light");
        $(".navbar-dark-scrolled").addClass("navbar-dark");
        $(".navbar-dark").removeClass("navbar-dark-scrolled");
        $(".navbar").removeClass("navbar-light-scrolled");
    }
}


// Scrolled navbar init
$(window).scroll(function() { scrolled_navbar(); });
$(document).ready(function() { scrolled_navbar(); });


// Auto-hide for navbar
$(".auto-hiding-navbar").autoHidingNavbar({
    "animationDuration": 300,
    "showOnBottom": false
});


// Open dropdowns by hover
const $dropdown = $(".dropdown");
const $dropdownToggle = $(".dropdown-toggle");
const $dropdownMenu = $(".dropdown-menu");
const showClass = "show";

$(window).on("load resize", function() {
    if (this.matchMedia("(min-width: 992px)").matches) {
        $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
        );
    } else {
        $dropdown.off("mouseenter mouseleave");
    }
});


// Tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})


// Counters
import { CountUp } from '/js/countUp.js';

var counter_1 = new CountUp('counter_1', 2000);
var counter_2 = new CountUp('counter_2', 52);
var counter_3 = new CountUp('counter_3', 30000);
var counter_4 = new CountUp('counter_4', 9999);

// Start when counters becomes visible
$('.counter').one('inview', function(event, isInView) {
    if (isInView) {
        counter_1.start();
        counter_2.start();
        counter_3.start();
        counter_4.start();
    } else {
        countUp.pauseResume();
    }
});


// Parallax
$('.jarallax').jarallax({
    speed: 0.5
});


// AOS
AOS.init({
    once: true,
    startEvent: 'load'
});


// Slick carousel
$(document).ready(function() {

    $('.carousel-1-arrows').slick({
        slidesToShow:   1,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: true,
        autoplay: false,
        autoplaySpeed: 3000,
        lazyLoad: 'ondemand',

        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    autoplay: true
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    autoplay: true
                }
            }
        ]

    });

    $('.carousel-6').slick({
        slidesToShow:   6,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 2000,
        lazyLoad: 'ondemand',

        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            }
        ]

    });

    $('.carousel-3-dots').slick({
        slidesToShow:   3,
        slidesToScroll: 2,
        infinite: true,
        dots: true,
        autoplaySpeed: 3000,
        lazyLoad: 'ondemand',
        dotsClass: 'slick-dots',
        arrows: false,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

});


// Typed.js
$(document).ready(function() {
    if (document.getElementById("typed")) {
        var typed = new Typed('#typed', {
            strings: ["better", "fancy", "modern"],
            typeSpeed: 200,
            backSpeed: 200,
            smartBackspace: false,
            loop: true,
            shuffle: true,
        });
    }
});
