// Airframes aircraft and balloon map icons: the drawing source.
//
// Every icon is drawn on a 32 x 32 grid, like the marine set. Aircraft point
// north (up) and turn about the center (16, 16), so a map can rotate them by
// track or heading. Balloon icons are upright symbols and do not turn.
//
// Aircraft are recolorable: apps often color them by altitude or by basemap,
// so their drawings use the {{fill}} and {{stroke}} tokens, and details are
// translucent white or black so they read on any fill. Balloon icons keep
// their own colors.
//
// `scale` is the icon's size relative to a narrow-body airliner (1). It is
// not a true size ratio, only enough that a 747 reads bigger than a Cessna.
//
// build.mjs turns this file into the SVG files, the TypeScript module the apps
// copy, the sprite sheets and the preview sheet. Edit here, then run
// `node aircraft/src/build.mjs`.

const FILL = '{{fill}}';
const STROKE = '{{stroke}}';
const WHITE = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.55)';
const SHADE = 'rgba(0,0,0,0.3)';

const f = (n) => +n.toFixed(2);

/**
 * A left-right symmetric outline. `right` runs down the right-hand side from
 * the nose (on the center line) to the tail (on the center line).
 */
export function sym(right) {
  const pts = right.map(([x, y]) => [f(x), f(y)]);
  const mirror = pts
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [f(32 - x), y]);
  return 'M' + [...pts, ...mirror].map(([x, y]) => `${x} ${y}`).join('L') + 'Z';
}

/** A rounded rectangle and its mirror image across the center line. */
export function pair(x, y, w, h, r = Math.min(w, h) / 2) {
  const rect = (x0) =>
    `M${f(x0 + r)} ${f(y)}H${f(x0 + w - r)}Q${f(x0 + w)} ${f(y)} ${f(x0 + w)} ${f(y + r)}V${f(y + h - r)}` +
    `Q${f(x0 + w)} ${f(y + h)} ${f(x0 + w - r)} ${f(y + h)}H${f(x0 + r)}Q${f(x0)} ${f(y + h)} ${f(x0)} ${f(y + h - r)}` +
    `V${f(y + r)}Q${f(x0)} ${f(y)} ${f(x0 + r)} ${f(y)}Z`;
  return rect(x) + rect(32 - x - w);
}

/** A straight bar from (x1, y1) to (x2, y2), `w` wide, as a closed path. */
function bar(x1, y1, x2, y2, w) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = Math.hypot(dx, dy);
  const nx = (-dy / l) * (w / 2);
  const ny = (dx / l) * (w / 2);
  return `M${f(x1 + nx)} ${f(y1 + ny)}L${f(x2 + nx)} ${f(y2 + ny)}L${f(x2 - nx)} ${f(y2 - ny)}L${f(x1 - nx)} ${f(y1 - ny)}Z`;
}

const circle = (cx, cy, r) => `M${f(cx - r)} ${cy}A${r} ${r} 0 1 0 ${f(cx + r)} ${cy}A${r} ${r} 0 1 0 ${f(cx - r)} ${cy}Z`;
const ellipse = (cx, cy, rx, ry) => `M${f(cx - rx)} ${cy}A${rx} ${ry} 0 1 0 ${f(cx + rx)} ${cy}A${rx} ${ry} 0 1 0 ${f(cx - rx)} ${cy}Z`;

const CIVIL = { color: '#2b6cd4', stroke: '#123a7a' };
const MIL = { color: '#5f6f52', stroke: '#2b3424' };

/** A cockpit windshield arc at the nose. */
const windshield = (y, w = 1) => `<path d="M${16 - w} ${y + 0.5}Q16 ${y - 0.3} ${16 + w} ${y + 0.5}" stroke="${SHADE}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`;
/** Propeller discs drawn as thin bars across the front of each engine or the nose. */
const props = (...bars) => bars.map(([x1, x2, y]) => `<path d="M${x1} ${y}H${x2}" stroke="${STROKE}" stroke-width="1.1" stroke-linecap="round"/>`).join('');
const propHalo = (...bars) => `<path d="${bars.map(([x1, x2, y]) => `M${x1} ${y}H${x2}`).join('')}" stroke-width="3.4" fill="none"/>`;

const AIRLINER = sym([[16, 1.6], [16.9, 2.3], [17.5, 3.8], [17.7, 6], [17.7, 11.4], [28.6, 17.4], [28.6, 19], [17.7, 16.4], [17.6, 24.2], [22, 27.4], [22, 28.8], [17.2, 27.9], [16.6, 30], [16, 30.4]]);
const WIDE = sym([[16, 1.2], [17.3, 1.9], [18, 3.6], [18.2, 6], [18.2, 11.6], [30.4, 18.6], [30.4, 20.2], [18.2, 17], [18.1, 24.4], [23.6, 28], [23.6, 29.4], [17.6, 28.4], [16.8, 30.6], [16, 30.9]]);
const BIG_PROP_WING = [[16, 2], [17.2, 2.6], [17.9, 4.4], [18.1, 7], [18.1, 11], [30.4, 11.6], [30.8, 12], [30.8, 13.6], [30.4, 14], [18.1, 15], [17.9, 25], [23.4, 26], [23.8, 26.4], [23.8, 28], [23.4, 28.4], [17.2, 28.4], [16.6, 30.4], [16, 30.6]];

/**
 * Categories. `types` are ICAO aircraft type designators (or prefixes ending
 * in `*`) that select the icon; `adsb` are ADS-B emitter categories.
 */
export const ICONS = [
  {
    key: 'airliner', label: 'Airliner (narrow-body)', group: 'Airliners', ...CIVIL, rotate: true, scale: 1,
    adsb: ['A3', 'A4'],
    body: [AIRLINER, pair(20.9, 12.4, 1.8, 4, 0.8)],
    details: [windshield(4.4)],
  },
  {
    key: 'widebody', label: 'Wide-body twin', group: 'Airliners', ...CIVIL, rotate: true, scale: 1.25,
    adsb: ['A5'],
    body: [WIDE, pair(21.4, 12.2, 2.2, 4.8, 1)],
    details: [windshield(3.8, 1.2)],
  },
  {
    key: 'quad', label: 'Four-engine jet', group: 'Airliners', ...CIVIL, rotate: true, scale: 1.4,
    body: [WIDE, pair(20.4, 12, 1.8, 3.8, 0.8), pair(24.8, 14.6, 1.7, 3.6, 0.8)],
    details: [windshield(3.8, 1.2)],
  },
  {
    key: 'regional', label: 'Regional jet', group: 'Airliners', ...CIVIL, rotate: true, scale: 0.85,
    body: [
      sym([[16, 2.2], [16.8, 2.9], [17.3, 4.4], [17.4, 6.5], [17.4, 13], [26.4, 18], [26.4, 19.4], [17.4, 17.2], [17.3, 27], [21.4, 28.6], [21.4, 29.8], [16.8, 29.4], [16.4, 30.6], [16, 30.8]]),
      pair(17.7, 21.2, 2.1, 4.6, 1),
    ],
    details: [windshield(4.6, 0.9)],
  },
  {
    key: 'turboprop', label: 'Turboprop airliner', group: 'Airliners', ...CIVIL, rotate: true, scale: 0.8,
    body: [
      sym([[16, 2.6], [16.9, 3.3], [17.4, 4.8], [17.5, 7], [17.5, 11.8], [29, 11.8], [29.4, 12.2], [29.4, 13.8], [29, 14.2], [17.5, 14.6], [17.4, 25.4], [21.6, 26.6], [21.6, 28], [16.8, 27.8], [16.4, 29.8], [16, 30]]),
      pair(20.6, 9.2, 2, 8, 1),
    ],
    details: [windshield(4.8, 0.9), props([18.6, 24.6, 8.6], [7.4, 13.4, 8.6])],
    haloExtra: propHalo([18.6, 24.6, 8.6], [7.4, 13.4, 8.6]),
  },
  {
    key: 'bizjet', label: 'Business jet', group: 'General aviation', ...CIVIL, rotate: true, scale: 0.7,
    body: [
      sym([[16, 1.8], [16.6, 3], [17.1, 5.2], [17.3, 8], [17.3, 14.6], [26.2, 21.4], [26.8, 21.2], [26.8, 22.6], [17.3, 19.2], [17.2, 26.6], [20.8, 28.6], [20.8, 29.8], [16.7, 29.3], [16.3, 30.4], [16, 30.6]]),
      pair(17.6, 20.2, 1.8, 4.4, 0.9),
    ],
    details: [windshield(5, 0.9)],
  },
  {
    key: 'light', label: 'Light aircraft', group: 'General aviation', ...CIVIL, rotate: true, scale: 0.6,
    adsb: ['A1'],
    body: [sym([[16, 4.6], [17, 4.9], [17.5, 6], [17.6, 9.4], [29.6, 9.4], [30, 9.8], [30, 11.8], [29.6, 12.2], [17.5, 12.2], [16.9, 22.8], [16.9, 24], [21.6, 24], [22, 24.4], [22, 26], [21.6, 26.4], [16.6, 26.4], [16.4, 27.6], [16, 27.8]])],
    details: [props([12.4, 19.6, 3.6]), `<path d="M15 7.4H17" stroke="${SHADE}" stroke-width="1.2" stroke-linecap="round"/>`],
    haloExtra: propHalo([12.4, 19.6, 3.6]),
  },
  {
    key: 'light-twin', label: 'Light twin', group: 'General aviation', ...CIVIL, rotate: true, scale: 0.65,
    adsb: ['A2'],
    body: [
      sym([[16, 3.8], [16.9, 4.2], [17.4, 5.6], [17.5, 10.6], [29.4, 10.6], [29.8, 11], [29.8, 12.8], [29.4, 13.2], [17.5, 13.2], [17, 24], [21.6, 24.2], [22, 24.6], [22, 26], [21.6, 26.4], [16.6, 26.4], [16.3, 27.6], [16, 27.8]]),
      pair(21, 8.4, 2.2, 7, 1.1),
    ],
    details: [windshield(6, 0.9), props([19.4, 24.8, 7.8], [7.2, 12.6, 7.8])],
    haloExtra: propHalo([19.4, 24.8, 7.8], [7.2, 12.6, 7.8]),
  },
  {
    key: 'glider', label: 'Glider', group: 'General aviation', ...CIVIL, rotate: true, scale: 0.65,
    adsb: ['B1'],
    body: [sym([[16, 5.2], [16.7, 5.7], [17, 7.4], [17, 11.4], [30.8, 11.8], [31.2, 12.2], [31.2, 12.8], [30.8, 13.2], [17, 13.6], [16.6, 26.6], [20.6, 26.8], [20.8, 27.2], [20.8, 28], [20.4, 28.2], [16.4, 28.2], [16, 28.4]])],
    details: [`<path d="M16 7.2V10" stroke="${SHADE}" stroke-width="1" stroke-linecap="round"/>`],
  },
  {
    key: 'ultralight', label: 'Ultralight or hang glider', group: 'General aviation', ...CIVIL, rotate: true, scale: 0.55,
    adsb: ['B4'],
    body: ['M16 4L30 20.6L29.4 22L16 18.4L2.6 22L2 20.6Z'],
    details: [`<path d="${ellipse(16, 18.6, 1.6, 3.4)}" fill="${STROKE}"/>`, `<path d="M16 6.4V16" stroke="${SOFT}" stroke-width="1" stroke-linecap="round"/>`],
    haloExtra: `<path d="${ellipse(16, 18.6, 1.6, 3.4)}" stroke-width="2.6"/>`,
  },
  {
    key: 'helicopter', label: 'Helicopter', group: 'Rotorcraft and other', ...CIVIL, rotate: true, scale: 0.7,
    adsb: ['A7'],
    body: [ellipse(16, 13, 3.6, 5.4), 'M15.2 17H16.8V28.4H15.2Z', pair(13, 26.4, 2.6, 1.6, 0.6)],
    details: [
      `<path d="M6.2 5.2L25.8 20.8M25.8 5.2L6.2 20.8" stroke="${STROKE}" stroke-width="1.3" stroke-linecap="round"/>`,
      `<circle cx="16" cy="13" r="1.3" fill="${STROKE}"/>`,
      `<path d="M14.4 9.6Q16 8.6 17.6 9.6" stroke="${SHADE}" stroke-width="0.9" fill="none" stroke-linecap="round"/>`,
    ],
    haloExtra: `<path d="M6.2 5.2L25.8 20.8M25.8 5.2L6.2 20.8" stroke-width="3.6" fill="none"/>`,
  },
  {
    key: 'drone', label: 'Drone (UAV)', group: 'Rotorcraft and other', color: '#7048e8', stroke: '#341b8f', rotate: true, scale: 0.5,
    adsb: ['B6'],
    body: [bar(9.2, 9.2, 22.8, 22.8, 2), bar(22.8, 9.2, 9.2, 22.8, 2), 'M12.8 13.2Q12.8 11.6 14.4 11.6H17.6Q19.2 11.6 19.2 13.2V18.8Q19.2 20.4 17.6 20.4H14.4Q12.8 20.4 12.8 18.8Z'],
    details: [
      ...[[8.6, 8.6], [23.4, 8.6], [8.6, 23.4], [23.4, 23.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="rgba(255,255,255,0.4)" stroke="${STROKE}" stroke-width="1.1"/>`),
      `<path d="M14.6 14.4L16 12.6L17.4 14.4Z" fill="${WHITE}"/>`,
    ],
    haloExtra: [[8.6, 8.6], [23.4, 8.6], [8.6, 23.4], [23.4, 23.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.4" stroke-width="3.4"/>`).join(''),
  },
  {
    key: 'airship', label: 'Airship or blimp', group: 'Rotorcraft and other', color: '#adb5bd', stroke: '#495057', rotate: true, scale: 0.9,
    adsb: ['B2'],
    body: [sym([[16, 23], [19, 23.8], [23.6, 28.4], [23.6, 29.8], [18.6, 28.4], [16, 28.6]]), ellipse(16, 15, 5.4, 13)],
    details: [`<rect x="15" y="12.4" width="2" height="5.6" rx="1" fill="${SHADE}"/>`, `<path d="M13 6.4Q16 5 19 6.4" stroke="${SOFT}" stroke-width="1" fill="none" stroke-linecap="round"/>`],
  },
  {
    key: 'fighter', label: 'Fighter or fast jet', group: 'Military', ...MIL, rotate: true, scale: 0.75,
    adsb: ['A6'],
    body: [sym([[16, 1.4], [16.6, 2.6], [17.1, 5.4], [17.4, 10], [18, 13.4], [27, 22.4], [27, 24], [18.6, 22.6], [18.6, 25.2], [22, 28.4], [22, 29.6], [17.4, 28.6], [16.8, 30.6], [16, 30.8]])],
    details: [`<path d="${ellipse(16, 8.4, 0.95, 2.4)}" fill="${SOFT}"/>`],
  },
  {
    key: 'military-transport', label: 'Military transport or patrol', group: 'Military', ...MIL, rotate: true, scale: 1.15,
    body: [sym(BIG_PROP_WING), pair(20.6, 8.6, 1.8, 7.4, 0.9), pair(25.6, 9, 1.6, 7.2, 0.8)],
    details: [windshield(4.2, 1.1), props([19.2, 23.8, 8.2], [24.2, 28.6, 8.6], [8.2, 12.8, 8.2], [3.4, 7.8, 8.6])],
    haloExtra: propHalo([19.2, 23.8, 8.2], [24.2, 28.6, 8.6], [8.2, 12.8, 8.2], [3.4, 7.8, 8.6]),
  },
  {
    key: 'ground-vehicle', label: 'Airport ground vehicle', group: 'Rotorcraft and other', color: '#f59f00', stroke: '#7a4f00', rotate: true, scale: 0.45,
    adsb: ['C1', 'C2'],
    body: ['M11.6 8Q11.6 6 13.6 6H18.4Q20.4 6 20.4 8V24Q20.4 26 18.4 26H13.6Q11.6 26 11.6 24Z'],
    details: [`<rect x="12.8" y="7.4" width="6.4" height="4.4" rx="1" fill="${SHADE}"/>`, `<rect x="13" y="13.4" width="6" height="1.6" rx="0.8" fill="${WHITE}"/>`],
  },
  {
    key: 'unknown', label: 'Aircraft (type unknown)', group: 'Rotorcraft and other', color: '#8c96a3', stroke: '#454d57', rotate: true, scale: 0.85,
    body: [AIRLINER],
    details: [windshield(4.4)],
  },

  // ── Balloons (radiosondes and amateur high-altitude balloons) ────────────
  {
    key: 'balloon', label: 'Balloon (rising)', group: 'Balloons', color: '#f76707', stroke: '#8a3500', rotate: false, scale: 0.8, balloon: true,
    body: [ellipse(16, 10.4, 7.2, 8) + 'M14.6 18.2H17.4L16.6 19.8H15.4Z', { d: 'M13.2 24.2H18.8V29.4H13.2Z', fill: '#f8f9fa' }],
    details: [
      `<path d="M16 19.8V24.2" stroke="#8a3500" stroke-width="0.9"/>`,
      `<path d="${ellipse(13.2, 7.4, 1.6, 2.4)}" fill="${SOFT}"/>`,
      `<path d="M13.2 26.4H18.8" stroke="#f76707" stroke-width="1.2"/>`,
    ],
    haloExtra: `<path d="M16 19.8V24.2" stroke-width="2.8"/>`,
  },
  {
    key: 'parachute', label: 'Balloon (falling, after burst)', group: 'Balloons', color: '#f76707', stroke: '#8a3500', rotate: false, scale: 0.8, balloon: true,
    body: [
      'M5.6 14Q5.6 4 16 4T26.4 14Q23.8 12.4 21.2 14Q18.6 12.4 16 14Q13.4 12.4 10.8 14Q8.2 12.4 5.6 14Z',
      { d: 'M13.2 23.8H18.8V29H13.2Z', fill: '#f8f9fa' },
    ],
    details: [
      `<path d="M16 4.4V13.4M10.8 5.6Q9.6 9 10.8 13.4M21.2 5.6Q22.4 9 21.2 13.4" stroke="${SOFT}" stroke-width="1" fill="none"/>`,
      `<path d="M6 14.2L14 23.8M16 14L16 23.8M26 14.2L18 23.8" stroke="#8a3500" stroke-width="0.8" fill="none"/>`,
      `<path d="M13.2 26H18.8" stroke="#f76707" stroke-width="1.2"/>`,
    ],
    haloExtra: `<path d="M6 14.2L14 23.8M16 14L16 23.8M26 14.2L18 23.8" stroke-width="2.6" fill="none"/>`,
  },
  {
    key: 'landed', label: 'Balloon payload (landed)', group: 'Balloons', color: '#2f9e44', stroke: '#495057', rotate: false, scale: 0.7, balloon: true,
    body: [{ d: 'M10.6 19.2H21.4V27H10.6Z', fill: '#f8f9fa' }, { d: 'M12.2 5.2L20.6 8.2L12.2 11.2Z', fill: '#2f9e44', stroke: '#1b5e2a' }],
    details: [
      `<path d="M12.2 5.2V19.2" stroke="#495057" stroke-width="1.3" stroke-linecap="round"/>`,
      `<path d="M10.6 22.6H21.4" stroke="#f76707" stroke-width="1.4"/>`,
      `<path d="M5 28.6H27" stroke="#495057" stroke-width="1.4" stroke-linecap="round"/>`,
    ],
    haloExtra: `<path d="M12.2 5.2V19.2M5 28.6H27" stroke-width="3.6"/>`,
  },
  {
    key: 'burst', label: 'Burst point', group: 'Balloons', color: '#f76707', stroke: '#8a3500', rotate: false, scale: 0.6, balloon: true,
    body: [
      'M' +
        Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI) / 8 - Math.PI / 2;
          const r = i % 2 ? 5.4 : 12;
          return `${f(16 + r * Math.cos(a))} ${f(16 + r * Math.sin(a))}`;
        }).join('L') +
        'Z',
    ],
    details: [`<circle cx="16" cy="16" r="3" fill="#ffffff"/>`],
  },
  {
    key: 'landing', label: 'Predicted landing', group: 'Balloons', color: '#f76707', stroke: '#8a3500', rotate: false, scale: 0.7, balloon: true,
    fillRule: 'evenodd',
    body: [circle(16, 16, 10.4) + circle(16, 16, 7.6)],
    details: [`<path d="M16 2.6V10M16 22V29.4M2.6 16H10M22 16H29.4" stroke="#8a3500" stroke-width="1.4" stroke-linecap="round"/>`, `<circle cx="16" cy="16" r="1.8" fill="#f76707" stroke="#8a3500" stroke-width="0.8"/>`],
    haloExtra: `<path d="M16 2.6V10M16 22V29.4M2.6 16H10M22 16H29.4" stroke-width="3.6"/>`,
  },
];

/** Darkens a #rrggbb color, for an outline that matches a custom fill. */
export function darken(hex, amount = 0.5) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - amount)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/**
 * One icon as a standalone SVG document. Aircraft keep the {{fill}} and
 * {{stroke}} tokens when `template` is true, so an app can recolor them.
 */
export function iconSvg(icon, { size = 32, halo = true, template = false } = {}) {
  const sw = icon.strokeWidth ?? 1.1;
  const rule = icon.fillRule ? ` fill-rule="${icon.fillRule}"` : '';
  const parts = [];
  const bodies = icon.body.map((b) => (typeof b === 'string' ? { d: b } : b));
  if (halo) {
    parts.push(
      `<g fill="#fff" stroke="#fff" stroke-linejoin="round" stroke-linecap="round" opacity="0.92">` +
        bodies.map((b) => `<path d="${b.d}" stroke-width="${sw + 2.6}"/>`).join('') +
        (icon.haloExtra ?? '') +
        `</g>`,
    );
  }
  for (const b of bodies)
    parts.push(`<path d="${b.d}" fill="${b.fill ?? FILL}"${rule} stroke="${b.stroke ?? STROKE}" stroke-width="${sw}" stroke-linejoin="round"/>`);
  parts.push(icon.details.join(''));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${parts.join('')}</svg>`;
  if (!template) svg = svg.replaceAll(FILL, icon.color).replaceAll(STROKE, icon.stroke);
  return svg;
}
