/* Generates assets/philly-map.svg — a real Philadelphia basemap
   (roads + water from OSM/OpenDataPhilly) with SEPTA rail lines
   overlaid, including self-contained draw-in animations. */

import { writeFile, mkdir } from 'node:fs/promises';

// ── projection ─────────────────────────────────────────────
const W = 900, H = 700;
const LON_MIN = -75.42, LON_MAX = -74.93;
const LAT_MIN = 39.83, LAT_MAX = 40.12;
const KX = W / (LON_MAX - LON_MIN);
const KY = KX * 1.305; // ~1/cos(40°)
const px = (lon) => (lon - LON_MIN) * KX;
const py = (lat) => (LAT_MAX - lat) * KY;

function thin(coords, minDist = 1.3) {
	const out = [];
	let last = null;
	for (const [lon, lat] of coords) {
		const x = px(lon), y = py(lat);
		if (!last || Math.hypot(x - last[0], y - last[1]) > minDist) {
			out.push([x, y]);
			last = [x, y];
		}
	}
	if (coords.length > 1) {
		const [lon, lat] = coords[coords.length - 1];
		const x = px(lon), y = py(lat);
		const l = out[out.length - 1];
		if (!l || l[0] !== x || l[1] !== y) out.push([x, y]);
	}
	return out;
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();
function toPath(pts, close = false) {
	if (pts.length < 2) return '';
	let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
	for (let i = 1; i < pts.length; i++) d += `L${fmt(pts[i][0])} ${fmt(pts[i][1])}`;
	return close ? d + 'Z' : d;
}

// ── fetch OSM via Overpass ─────────────────────────────────
const bbox = `${LAT_MIN},${LON_MIN},${LAT_MAX},${LON_MAX}`;
const query = `[out:json][timeout:180];
(
  way["highway"~"^(motorway|trunk|primary)$"](${bbox});
  way["railway"~"^(subway|tram|light_rail)$"](${bbox});
  way["railway"="rail"]["usage"="main"](${bbox});
  way["leisure"~"^(park|golf_course|nature_reserve)$"](${bbox});
  way["landuse"~"^(forest|recreation_ground)$"](${bbox});
  node["station"="subway"](${bbox});
);
out geom;`;

async function overpass() {
	const endpoints = [
		'https://overpass-api.de/api/interpreter',
		'https://overpass.kumi.systems/api/interpreter',
	];
	for (const url of endpoints) {
		try {
			console.log('overpass:', url);
			const res = await fetch(url, {
				method: 'POST',
				body: 'data=' + encodeURIComponent(query),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'User-Agent': 'zyang-personal-site-basemap/1.0 (one-time build script)',
				},
			});
			if (!res.ok) throw new Error('HTTP ' + res.status);
			return await res.json();
		} catch (e) {
			console.warn('  failed:', e.message);
		}
	}
	throw new Error('all overpass endpoints failed');
}

// ── fetch water polygons (OpenDataPhilly ArcGIS) ───────────
async function water() {
	const url =
		'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/PHL_water/FeatureServer/0/query' +
		'?where=1%3D1&outFields=*&outSR=4326&f=geojson';
	try {
		console.log('hydro:', url.slice(0, 80) + '…');
		const res = await fetch(url, {
			headers: { 'User-Agent': 'zyang-personal-site-basemap/1.0 (one-time build script)' },
		});
		if (!res.ok) throw new Error('HTTP ' + res.status);
		const gj = await res.json();
		if (!gj.features) throw new Error('no features');
		console.log('  water features:', gj.features.length);
		return gj;
	} catch (e) {
		console.warn('  hydro failed:', e.message);
		return null;
	}
}

const [osm, hydro] = await Promise.all([overpass(), water()]);

// ── classify OSM elements ──────────────────────────────────
const roadsMajor = []; // motorway/trunk
const roadsMid = []; // primary
const railHeavy = []; // regional rail
const trams = [];
const subways = { mfl: [], bsl: [], patco: [], other: [] };
const stations = [];
const parks = [];

function ringArea(pts) {
	let a = 0;
	for (let i = 0; i < pts.length - 1; i++)
		a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
	return Math.abs(a / 2);
}

for (const el of osm.elements) {
	if (el.type === 'node') {
		if (el.tags && el.tags.station === 'subway') stations.push([px(el.lon), py(el.lat), el.tags.name || '']);
		continue;
	}
	if (!el.geometry) continue;
	const pts = thin(el.geometry.map((g) => [g.lon, g.lat]));
	if (pts.length < 2) continue;
	const t = el.tags || {};
	if (t.highway === 'motorway' || t.highway === 'trunk')
		roadsMajor.push(thin(el.geometry.map((g) => [g.lon, g.lat]), 2.2));
	else if (t.highway === 'primary')
		roadsMid.push(thin(el.geometry.map((g) => [g.lon, g.lat]), 2.6));
	else if (t.leisure || t.landuse) {
		const ring = thin(el.geometry.map((g) => [g.lon, g.lat]), 2);
		if (ring.length > 3 && ringArea(ring) > 45) parks.push(ring);
	} else if (t.railway === 'subway') {
		const name = (t.name || '') + ' ' + (t.line || '');
		if (/broad|ridge/i.test(name)) subways.bsl.push(pts);
		else if (/market|frankford/i.test(name)) subways.mfl.push(pts);
		else if (/patco|lindenwold/i.test(name)) subways.patco.push(pts);
		else subways.other.push(pts);
	} else if (t.railway === 'tram' || t.railway === 'light_rail') trams.push(pts);
	else if (t.railway === 'rail') railHeavy.push(pts);
}

console.log(
	'roads M/P:', roadsMajor.length, roadsMid.length,
	'| rail:', railHeavy.length, 'tram:', trams.length, 'parks:', parks.length,
	'| subway mfl/bsl/patco/other:',
	subways.mfl.length, subways.bsl.length, subways.patco.length, subways.other.length,
	'| stations:', stations.length
);

// ── water paths ────────────────────────────────────────────
let waterD = '';
if (hydro) {
	for (const f of hydro.features) {
		const geom = f.geometry;
		if (!geom) continue;
		const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
		for (const poly of polys) {
			for (const ring of poly) {
				const pts = thin(ring, 1.6);
				if (pts.length > 3) waterD += toPath(pts, true);
			}
		}
	}
}

// ── station thinning ───────────────────────────────────────
const keptStations = [];
for (const s of stations) {
	if (s[0] < -10 || s[0] > W + 10 || s[1] < -10 || s[1] > H + 10) continue;
	if (keptStations.every((k) => Math.hypot(k[0] - s[0], k[1] - s[1]) > 13)) keptStations.push(s);
}

const merge = (list) => list.map((pts) => toPath(pts)).join('');

// key locations
const cityHall = [px(-75.1635), py(39.9526)];
const thirtieth = [px(-75.1818), py(39.9557)];

// little moments of urban perception, scattered across the city
const emojis = [
	['☕', -75.1719, 39.9496], // ☕ Rittenhouse Square
	['\u{1F6B6}', -75.1583, 39.9412], // 🚶 South Street
	['\u{1F332}', -75.2093, 40.0025], // 🌲 Fairmount Park
	['\u{1F393}', -75.1932, 39.9515], // 🎓 University City
	['\u{1F3DF}️', -75.1673, 39.9057], // 🏟️ Sports Complex
	['\u{1F6B2}', -75.1705, 39.9656], // 🚲 Ben Franklin Parkway
	['\u{1F914}', -75.141, 39.9663], // 🤔 Northern Liberties
	['\u{1F60C}', -75.211, 39.9489], // 😌 Clark Park
	['\u{1F30A}', -75.1405, 39.9465], // 🌊 Penn's Landing
	['\u{1F3D8}️', -75.24, 39.918], // 🏘️ Southwest Philly
];

// ── assemble SVG ───────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.rl{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 3s cubic-bezier(.3,0,.2,1) forwards}
.d1{animation-delay:.4s}.d2{animation-delay:.9s}.d3{animation-delay:1.4s}
@keyframes draw{to{stroke-dashoffset:0}}
.st{opacity:0;animation:pop .6s ease forwards}
.s1{animation-delay:1.4s}.s2{animation-delay:1.8s}.s3{animation-delay:2.2s}
@keyframes pop{to{opacity:1}}
.pulse{transform-origin:center;transform-box:fill-box;opacity:0;animation:pulse 4.5s ease-out 3s infinite}
.pulse.p2{animation-delay:4.4s}
@keyframes pulse{0%{transform:scale(.4);opacity:.55}60%,100%{transform:scale(2.6);opacity:0}}
@media(prefers-reduced-motion:reduce){
.rl{animation:none;stroke-dashoffset:0}.st{animation:none;opacity:1}.pulse{animation:none;opacity:0}}
</style>
<g fill="#c8d5c5" opacity="0.5">
${parks.map((ring) => `<path d="${toPath(ring, true)}"/>`).join('\n')}
</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${merge(roadsMid)}" stroke="#0b2345" stroke-width="0.8" opacity="0.1"/>
<path d="${merge(roadsMajor)}" stroke="#0b2345" stroke-width="1.2" opacity="0.14"/>
</g>
<path d="${waterD}" fill="#8099b5" opacity="0.28" fill-rule="evenodd"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${merge(railHeavy)}" stroke="#0b2345" stroke-width="0.9" opacity="0.22" stroke-dasharray="7 4"/>
<g>
${trams.map((p) => `<path class="rl d3" pathLength="1" d="${toPath(p)}" stroke="#5c7b4f" stroke-width="1.7" opacity="0.6"/>`).join('\n')}
${subways.other.map((p) => `<path class="rl d2" pathLength="1" d="${toPath(p)}" stroke="#6685a8" stroke-width="2.2" opacity="0.7"/>`).join('\n')}
${subways.patco.map((p) => `<path class="rl d2" pathLength="1" d="${toPath(p)}" stroke="#a51c30" stroke-width="2.6" opacity="0.75"/>`).join('\n')}
${subways.mfl.map((p) => `<path class="rl" pathLength="1" d="${toPath(p)}" stroke="#456a96" stroke-width="3.4" opacity="0.9"/>`).join('\n')}
${subways.bsl.map((p) => `<path class="rl d1" pathLength="1" d="${toPath(p)}" stroke="#d76a54" stroke-width="3.4" opacity="0.9"/>`).join('\n')}
</g>
</g>
<g>
${keptStations
	.map((s, i) => {
		const cls = 's' + ((i % 3) + 1);
		return `<circle class="st ${cls}" cx="${fmt(s[0])}" cy="${fmt(s[1])}" r="3.6" fill="#0b2345" stroke="#faf8f4" stroke-width="1.8"/>`;
	})
	.join('\n')}
</g>
<g font-size="15" text-anchor="middle" dominant-baseline="central">
${emojis
	.map(
		([e, lon, lat], i) =>
			`<g class="st s${(i % 3) + 1}"><circle cx="${fmt(px(lon))}" cy="${fmt(py(lat))}" r="11" fill="#faf8f4" opacity="0.85"/><text x="${fmt(px(lon))}" y="${fmt(py(lat) + 1)}">${e}</text></g>`
	)
	.join('\n')}
</g>
<circle class="pulse p2" cx="${fmt(thirtieth[0])}" cy="${fmt(thirtieth[1])}" r="10" fill="none" stroke="#a51c30" stroke-width="1.3"/>
<circle class="st s2" cx="${fmt(thirtieth[0])}" cy="${fmt(thirtieth[1])}" r="5.5" fill="#faf8f4" stroke="#0b2345" stroke-width="2"/>
<circle class="pulse" cx="${fmt(cityHall[0])}" cy="${fmt(cityHall[1])}" r="14" fill="none" stroke="#a51c30" stroke-width="1.4"/>
<g class="st s1">
<circle cx="${fmt(cityHall[0])}" cy="${fmt(cityHall[1])}" r="10" fill="#faf8f4" stroke="#0b2345" stroke-width="3"/>
<circle cx="${fmt(cityHall[0])}" cy="${fmt(cityHall[1])}" r="4" fill="#a51c30"/>
</g>
</svg>`;

await mkdir('assets', { recursive: true });
await writeFile('assets/philly-map.svg', svg);
console.log('wrote assets/philly-map.svg —', Math.round(svg.length / 1024), 'KB');
