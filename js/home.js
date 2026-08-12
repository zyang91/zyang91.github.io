/* Homepage interactions: scroll reveals, framework activation,
   hero map parallax, nav state. Motion stays slow and subtle. */

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

	/* Hero map: extremely slow parallax */
	var heroMap = document.getElementById('hero-map');
	if (heroMap && !reducedMotion) {
		var ticking = false;
		window.addEventListener(
			'scroll',
			function () {
				if (ticking) return;
				ticking = true;
				window.requestAnimationFrame(function () {
					var y = window.scrollY;
					if (y < window.innerHeight * 1.2) {
						heroMap.style.transform = 'translateY(' + y * 0.08 + 'px)';
					}
					ticking = false;
				});
			},
			{ passive: true }
		);
	}
})();
