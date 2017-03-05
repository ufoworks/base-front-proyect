/*jquery está importado globalmente esto es así porque
la maquetación de header y footer corporativo
es externa y depende de jquery*/
import Flickity from 'flickity';
import ScrollMagic from 'scrollmagic';
import debounce from 'lodash/debounce';
import Cookies from 'js-cookie';
import 'flickity/dist/flickity.min.css';

const COOKIE_NAME = 'simon-lighting';
const BODY_COOKIE_CLASS = 'showcookie';
const $body = $('body');


// Preload ************************************
window.onload = function() {
	setTimeout(function(){
		$body.addClass('ready');
	},500);
	init();
}
// ********************************************

// Cookie Law *********************************
if (!Cookies.get(COOKIE_NAME)) {
  $body.addClass(BODY_COOKIE_CLASS);
  $('#cookies-ok').on('click', function(e){
    e.preventDefault();
    $body.removeClass(BODY_COOKIE_CLASS);
    Cookies.set(COOKIE_NAME, true, { expires: 365 })
  });
}

// ********************************************


// Scroll Scenes ********************************
var controller = new ScrollMagic.Controller({ globalSceneOptions: { triggerHook: 0.2 } });
var scrollScenes = [];

var calculeSceneDuration = debounce(function(){
  scrollScenes.forEach(function(item){
    item.scene.duration(item.el.height());
  });
}, 200);
// ********************************************


function init() {
	$('.js-carousel').each(function(index){
		new Flickity(this, {
			autoPlay: 3000,
			prevNextButtons: false
		});
	});

	$('#move-to-top').on('click', (e) => {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: 0
		}, 1000);
	});

	// Controla que estemos en la parte superior de la página para mostrar el boton de subir arriba

	new ScrollMagic.Scene({ offset:300 })
		.setClassToggle('#move-to-top', 'active')
		.addTo(controller);

	$('[data-slidedown-target]').on('click', (e) => {
		const $this = $(e.currentTarget);
		const $target = $($this.data('slidedown-target'));
		e.preventDefault();
		$target.slideToggle();
		$this.toggleClass('vertical-flip');
		calculeSceneDuration();
	});

	$('#mainmenu-btn').on('click', (e) => {
		const $this = $(e.currentTarget);
		console.log('$this', $this);
		e.preventDefault();
		$body.toggleClass('menuopen');
		$this.toggleClass('vertical-flip');
	});

	$('.js-scrollto').each(function(index) {
		const $target = $(`#${$(this).data('target')}`);
		const id = $(this).attr('id');
		const headerOffset = $('#siteheader').height();
		$(this).on('click', function(e) {
			e.preventDefault();
			$('html, body').animate({
				scrollTop: $target.offset().top - headerOffset
			}, 1000);
		});

		//Escenas para control de scroll
		scrollScenes.push({
		  scene: new ScrollMagic.Scene({triggerElement: $target[0], duration: $target.height()})
		        .setClassToggle('#' + id, "active")
		        .on('enter', function(e){
		          ga('send', 'event', 'contact', 'send', $target.id);
		        })
		        .addTo(controller),
		  el: $target
		});
	});

	$(window).on('resize', calculeSceneDuration);
}