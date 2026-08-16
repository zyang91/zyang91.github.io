/* Awards page: archive image viewer and section chips.
   Reveal, nav, and footer-year behaviors come from home.js. */

(function () {
	'use strict';

	/* ── Archive viewer ─────────────────────────────────────── */
	var box = document.getElementById('aw-lightbox');
	var boxImg = document.getElementById('aw-lightbox-img');
	var boxCap = document.getElementById('aw-lightbox-caption');
	var boxClose = document.getElementById('aw-lightbox-close');
	var lastFocused = null;

	function openBox(img) {
		if (!box) return;
		lastFocused = document.activeElement;
		boxImg.src = img.getAttribute('src');
		boxImg.alt = img.getAttribute('alt') || '';
		boxCap.innerHTML = img.getAttribute('data-caption') || '';
		box.hidden = false;
		document.body.classList.add('aw-lightbox-open');
		window.requestAnimationFrame(function () {
			box.classList.add('open');
		});
		boxClose.focus();
	}

	function closeBox() {
		if (!box || box.hidden) return;
		box.classList.remove('open');
		document.body.classList.remove('aw-lightbox-open');
		window.setTimeout(function () {
			box.hidden = true;
			boxImg.src = '';
		}, 280);
		if (lastFocused && lastFocused.focus) lastFocused.focus();
	}

	if (box) {
		document.querySelectorAll('img.aw-zoom').forEach(function (img) {
			img.addEventListener('click', function () {
				openBox(img);
			});
		});
		boxClose.addEventListener('click', closeBox);
		box.addEventListener('click', function (e) {
			if (e.target === box || e.target.tagName === 'FIGURE') closeBox();
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') closeBox();
		});
	}

	/* ── Section chips: highlight the section in view ───────── */
	var chips = Array.prototype.slice.call(
		document.querySelectorAll('.aw-chips a[href^="#"]')
	);
	if (!chips.length) return;

	var sections = chips
		.map(function (chip) {
			return document.getElementById(chip.getAttribute('href').slice(1));
		})
		.filter(Boolean);

	function onScroll() {
		var probe = window.scrollY + window.innerHeight * 0.3;
		var current = null;
		sections.forEach(function (section) {
			if (section.offsetTop <= probe) current = section;
		});
		chips.forEach(function (chip) {
			chip.classList.toggle(
				'active',
				!!current && chip.getAttribute('href') === '#' + current.id
			);
		});
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
