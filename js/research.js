/* Research Hub: network diagram activation, theme/method filtering,
   and the link between the two. Reveal, nav, and footer-year
   behaviors come from home.js. */

(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var body = document.body;

	/* ── Network diagram draws itself in ────────────────────── */
	var diagram = document.getElementById('research-network');
	if (diagram) {
		if (reducedMotion || !('IntersectionObserver' in window)) {
			diagram.classList.add('go');
		} else {
			var netObserver = new IntersectionObserver(
				function (entries) {
					if (entries[0].isIntersecting) {
						diagram.classList.add('go');
						netObserver.disconnect();
					}
				},
				{ threshold: 0.3 }
			);
			netObserver.observe(diagram);
		}
	}

	/* ── Shared filter state ────────────────────────────────── */
	var cards = Array.prototype.slice.call(
		document.querySelectorAll('.rh-project, .rh-arch-card')
	);
	var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
	var nodes = Array.prototype.slice.call(document.querySelectorAll('.rn-node'));
	var hubs = Array.prototype.slice.call(document.querySelectorAll('.rn-hub'));
	var status = document.getElementById('rh-filter-status');

	function tokens(el, attr) {
		var raw = el.getAttribute(attr);
		return raw ? raw.split(/\s+/) : [];
	}

	function matches(el, kind, value) {
		if (!value) return true;
		var attr = kind === 'method' ? 'data-methods' : 'data-themes';
		return tokens(el, attr).indexOf(value) !== -1;
	}

	/* kind is 'theme' or 'method'; value '' means show everything */
	function applyFilter(kind, value) {
		var count = 0;

		cards.forEach(function (card) {
			var hit = matches(card, kind, value);
			card.classList.toggle('is-match', hit);
			if (hit) count++;
		});

		nodes.concat(hubs).forEach(function (el) {
			el.classList.toggle('is-match', matches(el, kind, value));
		});

		body.classList.toggle('is-filtering', !!value);
		/* hubs only carry themes, so they stay lit under a method filter */
		body.classList.toggle('is-filtering-theme', !!value && kind === 'theme');

		chips.forEach(function (chip) {
			var on =
				!!value &&
				chip.getAttribute('data-filter') === value &&
				chip.getAttribute('data-filter-kind') === kind;
			chip.setAttribute('aria-pressed', on ? 'true' : 'false');
		});
		/* the "All" chip carries an empty filter value */
		chips.forEach(function (chip) {
			if (chip.getAttribute('data-filter') === '') {
				chip.setAttribute('aria-pressed', value ? 'false' : 'true');
			}
		});

		if (status) {
			status.textContent = value
				? 'Showing ' + count + ' of ' + cards.length + ' projects'
				: 'Showing all ' + cards.length + ' projects';
		}
	}

	var active = { kind: '', value: '' };

	function setFilter(kind, value) {
		/* clicking the active chip again clears the filter */
		if (active.kind === kind && active.value === value) {
			active = { kind: '', value: '' };
		} else {
			active = { kind: kind, value: value };
		}
		applyFilter(active.kind, active.value);
	}

	chips.forEach(function (chip) {
		chip.addEventListener('click', function () {
			setFilter(
				chip.getAttribute('data-filter-kind') || 'theme',
				chip.getAttribute('data-filter')
			);
		});
	});

	if (chips.length) applyFilter('', '');

	/* ── Network hubs ───────────────────────────────────────── */
	/* Hovering a hub previews its projects; clicking one filters
	   by that theme and follows the link down to the portfolio. */
	hubs.forEach(function (hub) {
		var theme = hub.getAttribute('data-theme');

		function peek(on) {
			if (!diagram) return;
			diagram.classList.toggle('peek', on);
			nodes.concat(hubs).forEach(function (el) {
				el.classList.toggle('is-peek', on && matches(el, 'theme', theme));
			});
		}

		hub.addEventListener('mouseenter', function () { peek(true); });
		hub.addEventListener('mouseleave', function () { peek(false); });
		hub.addEventListener('focus', function () { peek(true); });
		hub.addEventListener('blur', function () { peek(false); });
		hub.addEventListener('click', function () {
			peek(false);
			setFilter('theme', theme);
		});
	});

	/* ── Arriving at a card ─────────────────────────────────── */
	var flashTimer = null;
	function flash(id) {
		var target = id ? document.getElementById(id) : null;
		if (!target || cards.indexOf(target) === -1) return;
		cards.forEach(function (card) { card.classList.remove('is-flash'); });
		target.classList.add('is-flash');
		window.clearTimeout(flashTimer);
		flashTimer = window.setTimeout(function () {
			target.classList.remove('is-flash');
		}, 1600);
	}

	nodes.forEach(function (node) {
		node.addEventListener('click', function () {
			var href = node.getAttribute('href') || '';
			if (href.charAt(0) === '#') flash(href.slice(1));
		});
	});

	document.querySelectorAll('.rh-related a[href^="#"]').forEach(function (link) {
		link.addEventListener('click', function () {
			flash(link.getAttribute('href').slice(1));
		});
	});

	if (window.location.hash) flash(window.location.hash.slice(1));
})();
