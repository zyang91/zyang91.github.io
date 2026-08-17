/* Generates assets/globe-land.json — the geometry the About page's
   globe draws: a simplified world land silhouette plus the Chinese
   provinces Zhanchao has visited.

   Source: Natural Earth (public domain) via nvkelso/natural-earth-vector.
   Run:  node .claude/build-globe.mjs
   Only needs re-running if the visited-province list changes. */

import { writeFile } from 'node:fs/promises';

const LAND =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';
const PROVINCES =
	'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';

/* Every Chinese province/region EXCEPT these has been visited.
   Natural Earth spellings; "Xizang" is Tibet. */
const NOT_VISITED = new Set([
	'Xizang',
	'Xinjiang',
	'Heilongjiang',
	'Jilin',
	'Liaoning',
	'Jiangxi',
	'Fujian',
	'Chongqing',
]);

async function getJSON(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res.json();
}

/* ── Douglas–Peucker in lon/lat space ─────────────────────── */
function perpDist(p, a, b) {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const len = Math.hypot(dx, dy);
	if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
	return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function simplify(points, tol) {
	if (points.length < 3) return points;
	let maxD = 0;
	let idx = 0;
	for (let i = 1; i < points.length - 1; i++) {
		const d = perpDist(points[i], points[0], points[points.length - 1]);
		if (d > maxD) {
			maxD = d;
			idx = i;
		}
	}
	if (maxD <= tol) return [points[0], points[points.length - 1]];
	return simplify(points.slice(0, idx + 1), tol).slice(0, -1).concat(
		simplify(points.slice(idx), tol)
	);
}

function span(ring) {
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	for (const [x, y] of ring) {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}
	return Math.max(maxX - minX, maxY - minY);
}

/* rings → flat [lon,lat,lon,lat,…] arrays, rounded */
function pack(ring, decimals) {
	const k = Math.pow(10, decimals);
	const out = [];
	for (const [x, y] of ring) {
		out.push(Math.round(x * k) / k, Math.round(y * k) / k);
	}
	return out;
}

function ringsOf(geometry) {
	const { type, coordinates } = geometry;
	if (type === 'Polygon') return coordinates;
	if (type === 'MultiPolygon') return coordinates.flat();
	return [];
}

function prepare(geometry, { tol, minSpan, decimals }) {
	const out = [];
	for (const ring of ringsOf(geometry)) {
		if (span(ring) < minSpan) continue;
		const s = simplify(ring, tol);
		if (s.length < 4) continue;
		out.push(pack(s, decimals));
	}
	return out;
}

/* ── Build ────────────────────────────────────────────────── */
console.log('fetching land …');
const land = await getJSON(LAND);
console.log('fetching provinces …');
const provinces = await getJSON(PROVINCES);

const landRings = [];
for (const f of land.features) {
	landRings.push(...prepare(f.geometry, { tol: 0.4, minSpan: 1.6, decimals: 1 }));
}

const china = [];
for (const f of provinces.features) {
	const p = f.properties;
	if (p.admin !== 'China') continue;
	if (NOT_VISITED.has(p.name)) continue;
	const rings = prepare(f.geometry, { tol: 0.12, minSpan: 0.35, decimals: 2 });
	if (!rings.length) continue;
	china.push({ n: p.name_en || p.name, r: rings });
}

const payload = {
	note: 'Natural Earth (public domain), simplified. Built by .claude/build-globe.mjs',
	land: landRings,
	china,
};

const json = JSON.stringify(payload);
await writeFile(new URL('../assets/globe-land.json', import.meta.url), json);

console.log(
	`land rings: ${landRings.length}  ·  provinces: ${china.length}  ·  ${(
		json.length / 1024
	).toFixed(0)} KB`
);
console.log('provinces:', china.map((c) => c.n).join(', '));
