/* Generates assets/about/puzzle-map.svg — the world, cut into jigsaw
   pieces, with one piece lifted out and set beside the board. Used as
   the background motif of the "A little about me" section.

   Reuses the land geometry from assets/globe-land.json, so run
   .claude/build-globe.mjs first.

   Run: node .claude/build-puzzle.mjs */

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const here = (p) => new URL(p, import.meta.url);

const data = JSON.parse(await readFile(here('../assets/globe-land.json'), 'utf8'));

/* ── Board ────────────────────────────────────────────────── */
const BX = 22;
const BY = 18;
const BW = 720;
const BH = 360;
const COLS = 8;
const ROWS = 4;
const CW = BW / COLS;
const CH = BH / ROWS;
const R = 0.155 * CW; /* knob radius */
const NECK = 0.8 * R;

/* the piece that gets lifted out */
const GAP_R = 1;
const GAP_C = 5;

/* deterministic tab directions, so rebuilds are identical */
let seed = 20260816;
function rand() {
	seed = (seed * 1103515245 + 12345) & 0x7fffffff;
	return seed / 0x7fffffff;
}
const dir = () => (rand() < 0.5 ? -1 : 1);

/* hTabs[row][col] — horizontal cut lines, rows 0..ROWS (0 and ROWS are
   the board border, so they stay straight) */
const hTabs = [];
for (let r = 0; r <= ROWS; r++) {
	hTabs.push([]);
	for (let c = 0; c < COLS; c++) {
		hTabs[r].push(r === 0 || r === ROWS ? 0 : dir());
	}
}
const vTabs = [];
for (let r = 0; r < ROWS; r++) {
	vTabs.push([]);
	for (let c = 0; c <= COLS; c++) {
		vTabs[r].push(c === 0 || c === COLS ? 0 : dir());
	}
}

const n = (v) => Math.round(v * 10) / 10;

/* horizontal cut segment at line `r`, column `c` */
function hSeg(r, c, forward) {
	const y = BY + r * CH;
	const x0 = BX + c * CW;
	const x1 = x0 + CW;
	const t = hTabs[r][c];
	if (!t) return ` L ${n(forward ? x1 : x0)} ${n(y)}`;
	const mx = x0 + CW / 2;
	const sweep = forward ? (t > 0 ? 1 : 0) : t > 0 ? 0 : 1;
	if (forward) {
		return (
			` L ${n(mx - NECK)} ${n(y)}` +
			` A ${n(R)} ${n(R)} 0 1 ${sweep} ${n(mx + NECK)} ${n(y)}` +
			` L ${n(x1)} ${n(y)}`
		);
	}
	return (
		` L ${n(mx + NECK)} ${n(y)}` +
		` A ${n(R)} ${n(R)} 0 1 ${sweep} ${n(mx - NECK)} ${n(y)}` +
		` L ${n(x0)} ${n(y)}`
	);
}

/* vertical cut segment at line `c`, row `r` */
function vSeg(r, c, forward) {
	const x = BX + c * CW;
	const y0 = BY + r * CH;
	const y1 = y0 + CH;
	const t = vTabs[r][c];
	if (!t) return ` L ${n(x)} ${n(forward ? y1 : y0)}`;
	const my = y0 + CH / 2;
	const sweep = forward ? (t > 0 ? 1 : 0) : t > 0 ? 0 : 1;
	if (forward) {
		return (
			` L ${n(x)} ${n(my - NECK)}` +
			` A ${n(R)} ${n(R)} 0 1 ${sweep} ${n(x)} ${n(my + NECK)}` +
			` L ${n(x)} ${n(y1)}`
		);
	}
	return (
		` L ${n(x)} ${n(my + NECK)}` +
		` A ${n(R)} ${n(R)} 0 1 ${sweep} ${n(x)} ${n(my - NECK)}` +
		` L ${n(x)} ${n(y0)}`
	);
}

function piecePath(r, c) {
	return (
		`M ${n(BX + c * CW)} ${n(BY + r * CH)}` +
		hSeg(r, c, true) +
		vSeg(r, c + 1, true) +
		hSeg(r + 1, c, false) +
		vSeg(r, c, false) +
		' Z'
	);
}

/* ── Land, in equirectangular ─────────────────────────────── */
const px = (lon) => BX + ((lon + 180) / 360) * BW;
const py = (lat) => BY + ((90 - lat) / 180) * BH;

const landPaths = data.land
	.map((flat) => {
		let d = '';
		for (let i = 0; i < flat.length; i += 2) {
			d += (i ? 'L' : 'M') + n(px(flat[i])) + ' ' + n(py(flat[i + 1]));
		}
		return d + 'Z';
	})
	.join(' ');

/* ── Assemble ─────────────────────────────────────────────── */
const pieces = [];
for (let r = 0; r < ROWS; r++) {
	for (let c = 0; c < COLS; c++) pieces.push({ r, c, d: piecePath(r, c) });
}
const gap = pieces.find((p) => p.r === GAP_R && p.c === GAP_C);
const board = pieces.filter((p) => p !== gap);

/* the lifted piece: rotated about its own centre, then set down to the
   lower right of the board */
const gapCx = BX + (GAP_C + 0.5) * CW;
const gapCy = BY + (GAP_R + 0.5) * CH;
const DROP_X = 760 - gapCx;
const DROP_Y = 428 - gapCy;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 470" role="presentation">
	<defs>
		<g id="land"><path d="${landPaths}" fill="#dcc8a4"/></g>
		<clipPath id="board">${board.map((p) => `<path d="${p.d}"/>`).join('')}</clipPath>
		<clipPath id="gap"><path d="${gap.d}"/></clipPath>
	</defs>

	<!-- the board: land, cut into pieces, one socket empty -->
	<g clip-path="url(#board)"><use href="#land"/></g>
	<g fill="none" stroke="#f6f0e4" stroke-width="2.4" stroke-linejoin="round">
		${board.map((p) => `<path d="${p.d}"/>`).join('\n\t\t')}
	</g>
	<path d="${gap.d}" fill="none" stroke="#c4b391" stroke-width="1.6"
		stroke-dasharray="5 5"/>
	<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" fill="none"
		stroke="rgba(11,35,69,0.2)" stroke-width="1.6"/>

	<!-- and the piece that has not gone back in yet -->
	<g transform="translate(${n(DROP_X)} ${n(DROP_Y)}) rotate(-13 ${n(gapCx)} ${n(gapCy)})">
		<g clip-path="url(#gap)"><use href="#land"/></g>
		<path d="${gap.d}" fill="none" stroke="#b9a682" stroke-width="1.8"
			stroke-linejoin="round"/>
	</g>
</svg>
`;

await mkdir(here('../assets/about'), { recursive: true });
await writeFile(here('../assets/about/puzzle-map.svg'), svg);
console.log(`puzzle-map.svg — ${(svg.length / 1024).toFixed(0)} KB`);
