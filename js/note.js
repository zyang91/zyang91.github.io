/* Reading note: a hairline progress bar tracking position through
   the essay column, not the whole document. */

(function () {
	'use strict';

	var bar = document.getElementById('nt-progress');
	var article = document.querySelector('.nt-body article');
	if (!bar || !article) return;

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		bar.style.display = 'none';
		return;
	}

	var ticking = false;

	function update() {
		var top = article.getBoundingClientRect().top + window.scrollY;
		var span = article.offsetHeight - window.innerHeight * 0.7;
		var progress = span > 0 ? (window.scrollY - top + window.innerHeight * 0.7) / span : 0;
		if (progress < 0) progress = 0;
		if (progress > 1) progress = 1;
		bar.style.transform = 'scaleX(' + progress + ')';
	}

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
