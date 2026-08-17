/* About page — the interactive globe.

   ┌─────────────────────────────────────────────────────────┐
   │  TO ADD A PLACE: add one line to PLACES below.          │
   │  Everything else (globe dot, tooltip, text list) is     │
   │  generated from it.                                     │
   │                                                          │
   │  TO CHANGE WHICH CHINESE PROVINCES ARE SHADED: edit     │
   │  NOT_VISITED in .claude/build-globe.mjs and re-run      │
   │  `node .claude/build-globe.mjs`.                        │
   └─────────────────────────────────────────────────────────┘ */

(function () {
	'use strict';

	var PLACES = [
		/* United States */
		{ n: 'New York City, NY', g: 'United States', lon: -74.006, lat: 40.713 },
		{ n: 'Philadelphia, PA', g: 'United States', lon: -75.165, lat: 39.953 },
		{ n: 'Washington, DC', g: 'United States', lon: -77.037, lat: 38.907 },
		{ n: 'Boston, MA', g: 'United States', lon: -71.058, lat: 42.36 },
		{ n: 'Binghamton, NY', g: 'United States', lon: -75.918, lat: 42.099 },
		{ n: 'Syracuse, NY', g: 'United States', lon: -76.147, lat: 43.048 },
		{ n: 'Buffalo, NY', g: 'United States', lon: -78.878, lat: 42.886 },
		{ n: 'Cincinnati, OH', g: 'United States', lon: -84.512, lat: 39.103 },
		{ n: 'Miami, FL', g: 'United States', lon: -80.192, lat: 25.762 },
		{ n: 'Phoenix, AZ', g: 'United States', lon: -112.074, lat: 33.448 },
		{ n: 'Los Angeles, CA', g: 'United States', lon: -118.244, lat: 34.052 },
		{ n: 'San Francisco, CA', g: 'United States', lon: -122.419, lat: 37.775 },
		{ n: 'San Diego, CA', g: 'United States', lon: -117.161, lat: 32.716 },
		{ n: 'Las Vegas, NV', g: 'United States', lon: -115.139, lat: 36.17 },
		{ n: 'Seattle, WA', g: 'United States', lon: -122.332, lat: 47.606 },
		{ n: 'Medford, OR', g: 'United States', lon: -122.875, lat: 42.327 },
		{ n: 'Yellowstone National Park', g: 'United States', lon: -110.588, lat: 44.428 },
		{ n: 'Grand Canyon National Park', g: 'United States', lon: -112.14, lat: 36.057 },
		{ n: 'Moab, UT', g: 'United States', lon: -109.55, lat: 38.573 },
		{ n: 'Arches National Park', g: 'United States', lon: -109.592, lat: 38.733 },

		/* China — the shaded provinces carry the rest */
		{ n: 'Qingdao, Shandong', g: 'China', lon: 120.383, lat: 36.067, home: true },

		/* Europe */
		{ n: 'Reykjavík, Iceland', g: 'Europe', lon: -21.94, lat: 64.147 },
		{ n: 'London, United Kingdom', g: 'Europe', lon: -0.128, lat: 51.507 },
	];

	var VIEWS = {
		us: { lon: -98, lat: 39 },
		china: { lon: 105, lat: 34 },
		europe: { lon: -8, lat: 56 },
	};

	var stage = document.getElementById('globe-stage');
	var canvas = document.getElementById('globe');
	if (!stage || !canvas) return;

	var ctx = canvas.getContext('2d');
	var tip = document.getElementById('globe-tip');
	var hint = document.getElementById('globe-hint');
	var kickerEl = document.getElementById('globe-kicker');
	var nameEl = document.getElementById('globe-name');
	var subEl = document.getElementById('globe-sub');
	var listEl = document.getElementById('globe-list');
	var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var RAD = Math.PI / 180;
	var DEG = 180 / Math.PI;

	/* ── State ──────────────────────────────────────────────── */
	var centerLon = 40;
	var centerLat = 24;
	var spinning = !reducedMotion;
	var size = 0;
	var R = 0;
	var cx = 0;
	var cy = 0;
	var geo = { land: [], china: [] };
	var pointer = null; /* {x, y} in CSS px, or null */
	var hovered = null; /* cluster */
	var hoveredProvince = null;
	var flight = null; /* {fromLon, fromLat, toLon, toLat, t0} */
	var visible = true;
	var defaultSub = subEl ? subEl.textContent : '';

	/* ── Sizing ─────────────────────────────────────────────── */
	function resize() {
		var rect = stage.getBoundingClientRect();
		size = Math.max(200, Math.min(rect.width, rect.height));
		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(size * dpr);
		canvas.height = Math.round(size * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		cx = size / 2;
		cy = size / 2;
		R = size / 2 - 8;
	}

	if ('ResizeObserver' in window) {
		new ResizeObserver(resize).observe(stage);
	} else {
		window.addEventListener('resize', resize);
	}
	resize();

	/* ── Orthographic projection ────────────────────────────── */
	/* (x, y, z) below are the components of the point's unit vector in
	   the rotated viewing frame: x/y are what you see, z > 0 means the
	   point is on the near side of the sphere. */
	var sinP0 = 0;
	var cosP0 = 1;

	function setRotation() {
		sinP0 = Math.sin(centerLat * RAD);
		cosP0 = Math.cos(centerLat * RAD);
	}

	function project(lon, lat, out) {
		var l = (lon - centerLon) * RAD;
		var p = lat * RAD;
		var cosP = Math.cos(p);
		var sinP = Math.sin(p);
		var cosL = Math.cos(l);
		out[0] = cx + R * (cosP * Math.sin(l));
		out[1] = cy - R * (cosP0 * sinP - sinP0 * cosP * cosL);
		out[2] = sinP0 * sinP + cosP0 * cosP * cosL;
		return out;
	}

	/* inverse — screen px back to lon/lat, or null outside the disc */
	function unproject(sx, sy) {
		var x = (sx - cx) / R;
		var y = (cy - sy) / R;
		var rho = Math.hypot(x, y);
		if (rho > 1) return null;
		var c = Math.asin(rho);
		var sinC = Math.sin(c);
		var cosC = Math.cos(c);
		if (rho === 0) return [centerLon, centerLat];
		var lat = Math.asin(cosC * sinP0 + (y * sinC * cosP0) / rho) * DEG;
		var lon =
			centerLon +
			Math.atan2(x * sinC, rho * cosC * cosP0 - y * sinC * sinP0) * DEG;
		return [lon, lat];
	}

	/* ── Drawing ────────────────────────────────────────────── */
	var pt = [0, 0, 0];

	/* Rings are clipped against the horizon properly: the part of a ring
	   that swings behind the sphere is replaced by the matching arc of
	   the rim, so a landmass wrapping past the limb fills to the edge
	   instead of bleeding a chord across the disc. */
	var bx = new Float64Array(2048);
	var by = new Float64Array(2048);
	var bz = new Float64Array(2048);

	function ensureBuffers(n) {
		if (n <= bx.length) return;
		var size = 1 << Math.ceil(Math.log2(n));
		bx = new Float64Array(size);
		by = new Float64Array(size);
		bz = new Float64Array(size);
	}

	/* where the great-circle segment i→j crosses the horizon, as a unit
	   vector in the view plane */
	var crossX = 0;
	var crossY = 0;
	function horizonCross(i, j) {
		var t = bz[i] / (bz[i] - bz[j]);
		var x = bx[i] + t * (bx[j] - bx[i]);
		var y = by[i] + t * (by[j] - by[i]);
		var m = Math.hypot(x, y) || 1;
		crossX = x / m;
		crossY = y / m;
	}

	function rimArc(from, to) {
		var d = to - from;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		ctx.arc(cx, cy, R, from, from + d, d < 0);
	}

	/* withRim: close the gaps along the rim (for fills). Without it only
	   the visible coastline runs are traced (for strokes). */
	function traceRing(flat, withRim) {
		var n = flat.length >> 1;
		if (n < 3) return false;
		ensureBuffers(n);

		var start = -1;
		var hidden = 0;
		for (var i = 0; i < n; i++) {
			project(flat[2 * i], flat[2 * i + 1], pt);
			bx[i] = (pt[0] - cx) / R;
			by[i] = (cy - pt[1]) / R;
			bz[i] = pt[2];
			if (pt[2] > 0) {
				if (start < 0) start = i;
			} else hidden++;
		}
		if (start < 0) return false;

		ctx.beginPath();
		ctx.moveTo(cx + R * bx[start], cy - R * by[start]);

		var pending = null; /* rim angle we left the disc at */
		for (var k = 0; k < n; k++) {
			var a = (start + k) % n;
			var b = (start + k + 1) % n;
			var va = bz[a] > 0;
			var vb = bz[b] > 0;

			if (va && vb) {
				ctx.lineTo(cx + R * bx[b], cy - R * by[b]);
			} else if (va && !vb) {
				horizonCross(a, b);
				ctx.lineTo(cx + R * crossX, cy - R * crossY);
				pending = Math.atan2(-crossY, crossX);
			} else if (!va && !vb) {
				if (withRim && pending !== null) {
					var m = Math.hypot(bx[b], by[b]);
					if (m > 1e-9) {
						var ang = Math.atan2(-by[b] / m, bx[b] / m);
						rimArc(pending, ang);
						pending = ang;
					}
				}
			} else {
				horizonCross(a, b);
				var enter = Math.atan2(-crossY, crossX);
				if (withRim && pending !== null) rimArc(pending, enter);
				else ctx.moveTo(cx + R * crossX, cy - R * crossY);
				ctx.lineTo(cx + R * bx[b], cy - R * by[b]);
				pending = null;
			}
		}
		if (withRim || !hidden) ctx.closePath();
		return true;
	}

	function drawRings(rings, fill, stroke) {
		var i;
		if (fill) {
			ctx.fillStyle = fill;
			for (i = 0; i < rings.length; i++) {
				if (traceRing(rings[i], true)) ctx.fill();
			}
		}
		if (stroke) {
			ctx.strokeStyle = stroke;
			ctx.lineWidth = 0.9;
			for (i = 0; i < rings.length; i++) {
				if (traceRing(rings[i], false)) ctx.stroke();
			}
		}
	}

	function drawGraticule() {
		ctx.strokeStyle = 'rgba(11, 35, 69, 0.08)';
		ctx.lineWidth = 0.8;
		var lon, lat, first, i;
		for (lon = -180; lon < 180; lon += 30) {
			ctx.beginPath();
			first = true;
			for (lat = -90; lat <= 90; lat += 3) {
				project(lon, lat, pt);
				if (pt[2] <= 0) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(pt[0], pt[1]);
					first = false;
				} else ctx.lineTo(pt[0], pt[1]);
			}
			ctx.stroke();
		}
		for (lat = -60; lat <= 60; lat += 30) {
			ctx.beginPath();
			first = true;
			for (i = -180; i <= 180; i += 3) {
				project(i, lat, pt);
				if (pt[2] <= 0) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(pt[0], pt[1]);
					first = false;
				} else ctx.lineTo(pt[0], pt[1]);
			}
			ctx.stroke();
		}
	}

	function drawSphere() {
		var g = ctx.createRadialGradient(
			cx - R * 0.34,
			cy - R * 0.38,
			R * 0.1,
			cx,
			cy,
			R
		);
		g.addColorStop(0, '#f3f7f7');
		g.addColorStop(0.62, '#e2eaec');
		g.addColorStop(1, '#c9d6db');
		ctx.beginPath();
		ctx.arc(cx, cy, R, 0, Math.PI * 2);
		ctx.fillStyle = g;
		ctx.fill();
	}

	function drawRim() {
		ctx.beginPath();
		ctx.arc(cx, cy, R, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(11, 35, 69, 0.16)';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	/* points that land within 8px of each other share one dot */
	function clusters() {
		var out = [];
		for (var i = 0; i < PLACES.length; i++) {
			var pl = PLACES[i];
			project(pl.lon, pl.lat, pt);
			if (pt[2] <= 0.012) continue;
			var x = pt[0];
			var y = pt[1];
			var fade = Math.min(1, pt[2] / 0.16);
			var found = null;
			for (var j = 0; j < out.length; j++) {
				if (Math.hypot(out[j].x - x, out[j].y - y) < 8) {
					found = out[j];
					break;
				}
			}
			if (found) {
				found.places.push(pl);
				if (pl.home) found.home = true;
			} else {
				out.push({ x: x, y: y, fade: fade, home: !!pl.home, places: [pl] });
			}
		}
		return out;
	}

	function drawPoints(list) {
		for (var i = 0; i < list.length; i++) {
			var c = list[i];
			var on = hovered === c;
			var r = c.home ? 4.6 : 3.5;
			if (on) r += 1.6;
			ctx.globalAlpha = c.fade;

			if (c.home) {
				ctx.beginPath();
				ctx.arc(c.x, c.y, r + 6, 0, Math.PI * 2);
				ctx.strokeStyle = 'rgba(165, 28, 48, 0.35)';
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
			ctx.fillStyle = '#ffffff';
			ctx.fill();
			ctx.strokeStyle = c.home ? '#a51c30' : '#d76a54';
			ctx.lineWidth = c.home ? 3 : 2.4;
			ctx.stroke();

			if (c.places.length > 1 && !c.home) {
				ctx.beginPath();
				ctx.arc(c.x, c.y, r + 3.6, 0, Math.PI * 2);
				ctx.strokeStyle = 'rgba(215, 106, 84, 0.4)';
				ctx.lineWidth = 1;
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
		}
	}

	var lastClusters = [];

	function render() {
		setRotation();
		ctx.clearRect(0, 0, size, size);

		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy, R, 0, Math.PI * 2);
		ctx.clip();

		drawSphere();
		drawGraticule();
		drawRings(geo.land, '#e6d9c0', 'rgba(11, 35, 69, 0.17)');

		for (var i = 0; i < geo.china.length; i++) {
			var prov = geo.china[i];
			var on = hoveredProvince === prov;
			drawRings(prov.r, on ? 'rgba(215, 106, 84, 0.55)' : 'rgba(215, 106, 84, 0.3)', null);
		}

		lastClusters = clusters();
		drawPoints(lastClusters);

		ctx.restore();
		drawRim();
	}

	/* ── Readout + tooltip ──────────────────────────────────── */
	function names(cluster) {
		return cluster.places
			.map(function (p) {
				return p.n;
			})
			.join(' · ');
	}

	function updateReadout() {
		if (!nameEl) return;
		if (hovered) {
			kickerEl.textContent = hovered.places[0].home
				? 'Home'
				: hovered.places[0].g;
			nameEl.textContent = names(hovered);
			subEl.textContent = hovered.places[0].home
				? 'Coastal Shandong, and the reason I notice how places sit against water.'
				: 'Walked, ridden, or driven through.';
		} else if (hoveredProvince) {
			kickerEl.textContent = 'China · province visited';
			nameEl.textContent = hoveredProvince.n;
			subEl.textContent = 'One of 23 provinces and regions on the visited list.';
		} else {
			kickerEl.textContent = 'Somewhere out there';
			nameEl.textContent = 'Hover a point';
			subEl.textContent = defaultSub;
		}
	}

	function updateTip() {
		if (!tip) return;
		var target = hovered
			? { x: hovered.x, y: hovered.y, label: names(hovered) }
			: hoveredProvince && pointer
			? { x: pointer.x, y: pointer.y, label: hoveredProvince.n }
			: null;
		if (!target) {
			tip.hidden = true;
			return;
		}
		tip.hidden = false;
		tip.textContent = target.label;
		tip.style.left = target.x + 'px';
		tip.style.top = target.y + 'px';
	}

	/* ── Hit testing ────────────────────────────────────────── */
	function inRing(flat, lon, lat) {
		var inside = false;
		for (var i = 0, j = flat.length - 2; i < flat.length; j = i, i += 2) {
			var xi = flat[i];
			var yi = flat[i + 1];
			var xj = flat[j];
			var yj = flat[j + 1];
			if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
				inside = !inside;
			}
		}
		return inside;
	}

	function hitTest() {
		var prevPoint = hovered;
		var prevProv = hoveredProvince;
		hovered = null;
		hoveredProvince = null;

		if (pointer) {
			var best = null;
			var bestD = 15;
			for (var i = 0; i < lastClusters.length; i++) {
				var c = lastClusters[i];
				var d = Math.hypot(c.x - pointer.x, c.y - pointer.y);
				if (d < bestD) {
					bestD = d;
					best = c;
				}
			}
			if (best) {
				hovered = best;
			} else {
				var ll = unproject(pointer.x, pointer.y);
				if (ll && ll[0] > 70 && ll[0] < 140 && ll[1] > 15 && ll[1] < 55) {
					for (var p = 0; p < geo.china.length; p++) {
						var prov = geo.china[p];
						for (var r = 0; r < prov.r.length; r++) {
							if (inRing(prov.r[r], ll[0], ll[1])) {
								hoveredProvince = prov;
								break;
							}
						}
						if (hoveredProvince) break;
					}
				}
			}
		}

		stage.classList.toggle('is-over-point', !!hovered);
		if (prevPoint !== hovered || prevProv !== hoveredProvince) {
			updateReadout();
		}
		updateTip();
	}

	/* ── Interaction ────────────────────────────────────────── */
	function stopSpin() {
		spinning = false;
		if (hint) hint.classList.add('is-hidden');
	}

	var dragging = false;
	var lastX = 0;
	var lastY = 0;
	var moved = 0;

	canvas.addEventListener('pointerdown', function (e) {
		dragging = true;
		moved = 0;
		lastX = e.clientX;
		lastY = e.clientY;
		stage.classList.add('is-dragging');
		canvas.setPointerCapture(e.pointerId);
	});

	canvas.addEventListener('pointermove', function (e) {
		var rect = canvas.getBoundingClientRect();
		pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };

		if (dragging) {
			var dx = e.clientX - lastX;
			var dy = e.clientY - lastY;
			moved += Math.abs(dx) + Math.abs(dy);
			if (moved > 4) {
				stopSpin();
				flight = null;
				buttons.forEach(function (b) {
					b.classList.remove('is-active');
				});
			}
			centerLon -= (dx * 90) / R;
			centerLat += (dy * 90) / R;
			centerLat = Math.max(-72, Math.min(72, centerLat));
			lastX = e.clientX;
			lastY = e.clientY;
		}
	});

	function endDrag(e) {
		if (!dragging) return;
		dragging = false;
		stage.classList.remove('is-dragging');
		if (e && e.pointerId !== undefined && canvas.hasPointerCapture(e.pointerId)) {
			canvas.releasePointerCapture(e.pointerId);
		}
	}
	canvas.addEventListener('pointerup', endDrag);
	canvas.addEventListener('pointercancel', endDrag);

	canvas.addEventListener('pointerleave', function () {
		pointer = null;
	});

	buttons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			var v = VIEWS[btn.getAttribute('data-view')];
			if (!v) return;
			stopSpin();
			buttons.forEach(function (b) {
				b.classList.toggle('is-active', b === btn);
			});
			var delta = ((v.lon - centerLon + 540) % 360) - 180;
			flight = {
				fromLon: centerLon,
				fromLat: centerLat,
				dLon: delta,
				dLat: v.lat - centerLat,
				t0: performance.now(),
				dur: reducedMotion ? 1 : 1100,
			};
		});
	});

	/* ── Loop ───────────────────────────────────────────────── */
	function frame(now) {
		if (flight) {
			var t = Math.min(1, (now - flight.t0) / flight.dur);
			var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
			centerLon = flight.fromLon + flight.dLon * e;
			centerLat = flight.fromLat + flight.dLat * e;
			if (t >= 1) flight = null;
		} else if (spinning && !dragging) {
			centerLon += 0.055;
		}
		if (centerLon > 180) centerLon -= 360;
		if (centerLon < -180) centerLon += 360;

		render();
		hitTest();
		if (visible) requestAnimationFrame(frame);
	}

	if ('IntersectionObserver' in window) {
		new IntersectionObserver(
			function (entries) {
				var was = visible;
				visible = entries[0].isIntersecting;
				if (visible && !was) requestAnimationFrame(frame);
			},
			{ threshold: 0 }
		).observe(stage);
	}

	/* ── The text list, generated from PLACES ───────────────── */
	if (listEl) {
		var groups = {};
		var order = [];
		PLACES.forEach(function (p) {
			if (!groups[p.g]) {
				groups[p.g] = [];
				order.push(p.g);
			}
			groups[p.g].push(p.n);
		});
		var html = '';
		order.forEach(function (g) {
			html +=
				'<h4>' + g + '</h4><p>' + groups[g].join(' · ') + '</p>';
		});
		html +=
			'<h4>China · provinces &amp; regions</h4><p>Every province except Tibet, ' +
			'Xinjiang, Heilongjiang, Jilin, Liaoning, Jiangxi, Fujian, and Chongqing.</p>';
		listEl.innerHTML = html;
	}

	/* ── Geometry ───────────────────────────────────────────── */
	requestAnimationFrame(frame);

	fetch('../assets/globe-land.json')
		.then(function (r) {
			if (!r.ok) throw new Error(r.status);
			return r.json();
		})
		.then(function (data) {
			geo.land = data.land || [];
			geo.china = data.china || [];
		})
		.catch(function () {
			/* no geometry: the globe still spins with its graticule and points */
		});
})();
