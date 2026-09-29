/* Homepage interactions: scroll reveals, framework activation,
   hero artwork parallax, nav state. Motion stays slow and subtle. */

(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Footer year */
	var yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	/* Nav: border on scroll */
	var nav = document.getElementById('site-nav');
	function onNavScroll() {
		nav.classList.toggle('scrolled', window.scrollY > 10);
	}
	window.addEventListener('scroll', onNavScroll, { passive: true });
	onNavScroll();

	/* Nav: mobile toggle */
	var toggle = document.getElementById('nav-toggle');
	var links = document.getElementById('nav-links');
	if (toggle && links) {
		toggle.addEventListener('click', function () {
			var open = links.classList.toggle('open');
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		});
		links.addEventListener('click', function (e) {
			if (e.target.tagName === 'A') {
				links.classList.remove('open');
				toggle.setAttribute('aria-expanded', 'false');
			}
		});
	}

	/* Scroll reveal */
	var revealEls = document.querySelectorAll('.reveal');
	if (reducedMotion || !('IntersectionObserver' in window)) {
		revealEls.forEach(function (el) { el.classList.add('in-view'); });
	} else {
		var revealObserver = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('in-view');
						revealObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
		);
		revealEls.forEach(function (el) { revealObserver.observe(el); });
	}

	/* Research framework: the transit line draws itself and
	   stations open in sequence once the diagram scrolls into view */
	var framework = document.getElementById('framework-diagram');
	if (framework) {
		if (reducedMotion || !('IntersectionObserver' in window)) {
			framework.classList.add('go');
		} else {
			var fwObserver = new IntersectionObserver(
				function (entries) {
					if (entries[0].isIntersecting) {
						framework.classList.add('go');
						fwObserver.disconnect();
					}
				},
				{ threshold: 0.35 }
			);
			fwObserver.observe(framework);
		}
	}

	/* Hero artwork: extremely slow parallax on desktop */
	var heroArt = document.getElementById('hero-art');
	if (heroArt && !reducedMotion) {
		var ticking = false;
		window.addEventListener(
			'scroll',
			function () {
				if (ticking) return;
				ticking = true;
				window.requestAnimationFrame(function () {
					var y = window.scrollY;
					if (window.matchMedia('(min-width: 961px)').matches && y < window.innerHeight * 1.2) {
						heroArt.style.transform = 'translateY(' + y * 0.08 + 'px)';
					}
					ticking = false;
				});
			},
			{ passive: true }
		);
	}
})();


/* Progressive enhancement: content and complete figures remain visible without JS. */
(function () {
 'use strict';
 var story = document.getElementById('research-story');
 if (!story) return;
 var scenes = Array.from(story.querySelectorAll('.q-row'));
 var framework = story.querySelector('.system-layout');
 var stages = Array.from(story.querySelectorAll('.system-stage'));
 var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 var frame = 0;
 function clamp(value) { return Math.max(0, Math.min(1, value)); }
 function update() {
  frame = 0;
  var height = window.innerHeight;
  var bounds = story.getBoundingClientRect();
  story.style.setProperty('--story-progress', motion.matches ? 1 : clamp((height * .55 - bounds.top) / bounds.height));
  scenes.forEach(function (scene) {
   var rect = scene.getBoundingClientRect();
   var progress = motion.matches ? 1 : clamp((height * .9 - rect.top) / (rect.height * .75));
   scene.style.setProperty('--scene-progress', progress);

  });
  var route = framework.querySelector('.system-stages').getBoundingClientRect();
  framework.style.setProperty('--framework-progress', motion.matches ? 1 : clamp((height * .55 - route.top) / route.height));
  stages.forEach(function (stage) {
   stage.classList.toggle('is-active', motion.matches || stage.getBoundingClientRect().top < height * .55);
  });
 }
 function schedule() { if (!frame) frame = window.requestAnimationFrame(update); }
 window.addEventListener('scroll', schedule, { passive: true });
 window.addEventListener('resize', schedule);
 window.addEventListener('load', schedule);
 motion.addEventListener('change', schedule);
 if (document.fonts) document.fonts.ready.then(schedule);
 update();
})();
