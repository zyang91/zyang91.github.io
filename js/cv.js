/* CV page: sidebar scrollspy. Reveal, nav, and footer-year
   behaviors come from home.js. */

(function () {
	'use strict';

	var toc = document.getElementById('cv-toc');
	if (!toc) return;

	var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
	var sections = links
		.map(function (link) {
			return document.getElementById(link.getAttribute('href').slice(1));
		})
		.filter(Boolean);

	function setActive(id) {
		links.forEach(function (link) {
			link.classList.toggle('active', link.getAttribute('href') === '#' + id);
		});
	}

	function onScroll() {
		var probe = window.scrollY + window.innerHeight * 0.28;
		var current = sections[0];
		for (var i = 0; i < sections.length; i++) {
			if (sections[i].offsetTop <= probe) current = sections[i];
		}
		if (current) setActive(current.id);
	}

	var ticking = false;
	window.addEventListener(
		'scroll',
		function () {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(function () {
				onScroll();
				ticking = false;
			});
		},
		{ passive: true }
	);
	onScroll();
})();
