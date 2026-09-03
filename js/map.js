/* North Is a Choice: the plate rail.

   A fixed vertical nav down the right edge. It stays out of the way
   until the hero has scrolled past, then marks whichever plate the
   reader is currently in. */

(function () {
	'use strict';

	var rail = document.getElementById('mp-rail');
	if (!rail) return;

	var items = Array.prototype.slice
		.call(rail.querySelectorAll('a'))
		.map(function (a) {
			return { link: a, plate: document.querySelector(a.getAttribute('href')) };
		})
		.filter(function (item) {
			return item.plate;
		});
	if (!items.length) return;

	var hero = document.querySelector('.mp-hero');
	var current = null;

	/* The plates are wildly uneven in height — a square polar map runs far
	   taller than the interactive block — so "most visible" would always
	   favour the short ones. Take the last plate whose top has crossed a
	   line near the top of the screen instead. */
	function update() {
		var line = window.innerHeight * 0.35;
		var active = items[0];
		items.forEach(function (item) {
			if (item.plate.getBoundingClientRect().top <= line) active = item;
		});

		if (active !== current) {
			items.forEach(function (item) {
				item.link.parentNode.classList.toggle('is-current', item === active);
			});
			current = active;
		}

		var past = hero ? window.scrollY > hero.offsetHeight * 0.7 : true;
		rail.classList.toggle('is-visible', past);
	}

	var ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function () {
			update();
			ticking = false;
		});
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
	update();
})();
