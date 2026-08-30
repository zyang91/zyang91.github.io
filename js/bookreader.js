/* Planning-book reader: a page-at-a-time viewer built from
   pre-rendered page images, so a large InDesign PDF never has to
   be downloaded before the book can be read.

   Configured from data attributes on #reader:
     data-pages   total page count
     data-dir     directory holding p-NN.jpg and thumbs/t-NN.jpg
     data-label   short label used in the page counter */

(function () {
	'use strict';

	var reader = document.getElementById('reader');
	if (!reader) return;

	var total = parseInt(reader.getAttribute('data-pages'), 10) || 0;
	function sanitizeDir(value) {
		var s = String(value || '').trim();
		s = s.replace(/\\/g, '/');
		s = s.replace(/[^a-zA-Z0-9_./-]/g, '');
		s = s.replace(/(^|\/)\.\.(?=\/|$)/g, '');
		s = s.replace(/^\/+|\/+$/g, '');
		return s;
	}
	var dir = sanitizeDir(reader.getAttribute('data-dir'));
	if (!total) return;

	var img = document.getElementById('rd-page');
	var prev = document.getElementById('rd-prev');
	var next = document.getElementById('rd-next');
	var count = document.getElementById('rd-count');
	var strip = document.getElementById('rd-strip');
	var stage = document.getElementById('rd-stage');
	var fsBtn = document.getElementById('rd-fullscreen');
	var fitBtn = document.getElementById('rd-fit');

	function pad(n) { return n < 10 ? '0' + n : String(n); }
	function pageSrc(n) { return dir + '/p-' + pad(n) + '.jpg'; }

	/* Footer year, shared with the rest of the site */
	var yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	/* ── Thumbnail strip ─────────────────────────────────────── */
	var thumbs = [];
	for (var i = 1; i <= total; i++) {
		var b = document.createElement('button');
		b.type = 'button';
		b.className = 'rd-thumb';
		b.setAttribute('data-page', i);
		b.setAttribute('aria-label', 'Go to page ' + i);
		var t = document.createElement('img');
		t.src = dir + '/thumbs/t-' + pad(i) + '.jpg';
		t.alt = '';
		t.loading = 'lazy';
		b.appendChild(t);
		strip.appendChild(b);
		thumbs.push(b);
	}

	/* ── Paging ──────────────────────────────────────────────── */
	var current = 0;

	function preload(n) {
		if (n < 1 || n > total) return;
		var p = new Image();
		p.src = pageSrc(n);
	}

	function show(n, push) {
		n = Math.min(Math.max(n, 1), total);
		if (n === current) return;
		current = n;

		img.src = pageSrc(n);
		img.alt = 'Page ' + n + ' of the City of Chester comprehensive plan';
		count.textContent = n + ' / ' + total;
		prev.disabled = n === 1;
		next.disabled = n === total;

		thumbs.forEach(function (b, idx) {
			b.classList.toggle('current', idx + 1 === n);
		});
		var active = thumbs[n - 1];
		if (active) {
			strip.scrollTo({
				left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
				behavior: 'smooth'
			});
		}

		if (reader.classList.contains('fitw')) reader.scrollTop = 0;

		preload(n + 1);
		preload(n - 1);

		if (push !== false) {
			history.replaceState(null, '', '#p' + n);
		}
	}

	prev.addEventListener('click', function () { show(current - 1); });
	next.addEventListener('click', function () { show(current + 1); });

	strip.addEventListener('click', function (e) {
		var b = e.target.closest('.rd-thumb');
		if (b) show(parseInt(b.getAttribute('data-page'), 10));
	});

	document.addEventListener('keydown', function (e) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		if (e.key === 'ArrowRight' || e.key === 'PageDown') { show(current + 1); }
		else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { show(current - 1); }
		else if (e.key === 'Home') { show(1); }
		else if (e.key === 'End') { show(total); }
	});

	/* Swipe on touch screens */
	var startX = null;
	stage.addEventListener('touchstart', function (e) {
		startX = e.changedTouches[0].clientX;
	}, { passive: true });
	stage.addEventListener('touchend', function (e) {
		if (startX === null) return;
		var dx = e.changedTouches[0].clientX - startX;
		if (Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
		startX = null;
	}, { passive: true });

	/* ── Fit width ───────────────────────────────────────────── */
	/* Interior spreads are dense; fitting the page to the window
	   height makes them unreadable, so the reader can trade the
	   whole-page view for a full-width one and scroll. */
	if (fitBtn) {
		fitBtn.addEventListener('click', function () {
			var on = reader.classList.toggle('fitw');
			fitBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
			fitBtn.textContent = on ? 'Fit page' : 'Fit width';
			reader.scrollTop = 0;
		});
	}

	/* ── Fullscreen ──────────────────────────────────────────── */
	if (fsBtn && document.documentElement.requestFullscreen) {
		fsBtn.addEventListener('click', function () {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else {
				document.documentElement.requestFullscreen();
			}
		});
		document.addEventListener('fullscreenchange', function () {
			fsBtn.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
		});
	} else if (fsBtn) {
		fsBtn.hidden = true;
	}

	/* ── Open on the page named in the URL ───────────────────── */
	var hash = /^#p(\d+)$/.exec(window.location.hash);
	show(hash ? parseInt(hash[1], 10) : 1, !!hash);
})();
