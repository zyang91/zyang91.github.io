/* Places with Hidden Stories: the facade animation, the click-to-load
   film player, and the photo lightbox. Reveal, nav, and footer-year
   behaviors come from home.js. */

(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ── Hero facade: the windows light once it is on screen ── */
	var facade = document.getElementById('jc-facade');
	if (facade) {
		if (reducedMotion || !('IntersectionObserver' in window)) {
			facade.classList.add('go');
		} else {
			var facadeObserver = new IntersectionObserver(
				function (entries) {
					if (entries[0].isIntersecting) {
						facade.classList.add('go');
						facadeObserver.disconnect();
					}
				},
				{ threshold: 0.3 }
			);
			facadeObserver.observe(facade);
		}
	}

	/* ── Film: nothing loads from YouTube until it is asked for ── */
	var player = document.getElementById('jc-player');
	var screen = document.getElementById('jc-screen');
	if (player && screen) {
		screen.addEventListener('click', function () {
			var frame = document.createElement('iframe');
			frame.src =
				'https://www.youtube-nocookie.com/embed/TIqpjkU3VpA?autoplay=1&rel=0';
			frame.title = 'Changing Landscapes — Places with Hidden Stories';
			frame.allow =
				'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			frame.referrerPolicy = 'strict-origin-when-cross-origin';
			frame.allowFullscreen = true;
			screen.remove();
			player.appendChild(frame);
		});
	}

	/* ── Photo lightbox ─────────────────────────────────────── */
	var box = document.getElementById('jc-lightbox');
	var boxImg = document.getElementById('jc-lightbox-img');
	var boxCap = document.getElementById('jc-lightbox-caption');
	var boxClose = document.getElementById('jc-lightbox-close');
	var lastFocused = null;

	function openBox(img) {
		lastFocused = document.activeElement;
		boxImg.src = img.getAttribute('src');
		boxImg.alt = img.getAttribute('alt') || '';
		boxCap.textContent = img.getAttribute('data-caption') || '';
		box.hidden = false;
		document.body.classList.add('jc-lightbox-open');
		window.requestAnimationFrame(function () {
			box.classList.add('open');
		});
		boxClose.focus();
	}

	function closeBox() {
		if (box.hidden) return;
		box.classList.remove('open');
		document.body.classList.remove('jc-lightbox-open');
		window.setTimeout(function () {
			box.hidden = true;
			boxImg.src = '';
		}, 280);
		if (lastFocused && lastFocused.focus) lastFocused.focus();
	}

	if (box && boxImg && boxCap && boxClose) {
		document.querySelectorAll('img.jc-zoom').forEach(function (img) {
			img.addEventListener('click', function () {
				openBox(img);
			});
			/* The photographs carry small print worth enlarging, so the
			   zoom has to be reachable from the keyboard too. */
			img.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					openBox(img);
				}
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
})();
