// Airframes marine map icons: the drawing source.
//
// Every icon is drawn on a 32 x 32 grid. Ships and aircraft point north (up)
// and turn about the center (16, 16), so a map can rotate them by course or
// heading. Station, aid and beacon icons are upright symbols and do not turn.
//
// `scale` is the icon's size relative to a typical 100 m ship (1). It is not
// a true size ratio, only enough that a container ship reads bigger than a
// yacht; marineIconScale() uses the reported length instead when it is known.
//
// build.mjs turns this file into the SVG files, the TypeScript module the apps
// copy, the sprite sheets and the preview sheet. Edit here, then run
// `node marine/src/build.mjs`.

const C = 16;

/** A hull seen from above: pointed bow at `top`, square-ish stern at `bottom`. */
export function hull({ cx = C, top, bottom, hb, bow, r = 1.6, blunt = 0 }) {
  const t = top;
  const b = bottom;
  const k = blunt; // a blunt bow (tugs) keeps a flat nose this wide
  return [
    `M${cx - k} ${t}`,
    k ? `L${cx + k} ${t}` : '',
    `C${cx + k + (hb - k) * 0.55} ${t + bow * 0.12} ${cx + hb} ${t + bow * 0.55} ${cx + hb} ${t + bow}`,
    `L${cx + hb} ${b - r}`,
    `Q${cx + hb} ${b} ${cx + hb - r} ${b}`,
    `L${cx - hb + r} ${b}`,
    `Q${cx - hb} ${b} ${cx - hb} ${b - r}`,
    `L${cx - hb} ${t + bow}`,
    `C${cx - hb} ${t + bow * 0.55} ${cx - k - (hb - k) * 0.55} ${t + bow * 0.12} ${cx - k} ${t}`,
    'Z',
  ].join(' ');
}

const WHITE = 'rgba(255,255,255,0.9)';
const SOFT = 'rgba(255,255,255,0.55)';
const SHADE = 'rgba(0,0,0,0.28)';

/**
 * Categories. `codes` are the AIS ship and cargo type codes (ITU-R M.1371)
 * that select the icon; `names` are words seen in type text from decoders and
 * our API. `rotate` says whether the map turns the icon by course.
 */
export const ICONS = [
  {
    key: 'cargo', label: 'Cargo', group: 'Ships', color: '#2f9e44', stroke: '#1b5e2a', rotate: true, scale: 1.25,
    codes: [[70, 79]], names: ['cargo', 'container', 'bulk', 'reefer', 'vehicle carrier', 'ro-ro', 'general cargo'],
    body: hull({ top: 2.5, bottom: 29.5, hb: 5.6, bow: 7 }),
    details: [
      `<rect x="12.2" y="9.6" width="7.6" height="3.6" rx="0.5" fill="${SOFT}"/>`,
      `<rect x="12.2" y="14" width="7.6" height="3.6" rx="0.5" fill="${SOFT}"/>`,
      `<rect x="12.2" y="18.4" width="7.6" height="3.6" rx="0.5" fill="${SOFT}"/>`,
      `<rect x="11.6" y="23.6" width="8.8" height="3.4" rx="0.8" fill="${WHITE}"/>`,
    ],
  },
  {
    key: 'tanker', label: 'Tanker', group: 'Ships', color: '#e03131', stroke: '#8f1d1d', rotate: true, scale: 1.25,
    codes: [[80, 89]], names: ['tanker', 'lng', 'lpg', 'chemical', 'oil'],
    body: hull({ top: 2.5, bottom: 29.5, hb: 5.6, bow: 6.2, r: 2.4 }),
    details: [
      `<path d="M16 8.6V22" stroke="${WHITE}" stroke-width="1.1" stroke-linecap="round"/>`,
      `<circle cx="16" cy="10.6" r="1.9" fill="${SOFT}"/>`,
      `<circle cx="16" cy="15.3" r="1.9" fill="${SOFT}"/>`,
      `<circle cx="16" cy="20" r="1.9" fill="${SOFT}"/>`,
      `<rect x="11.6" y="23.8" width="8.8" height="3.2" rx="0.8" fill="${WHITE}"/>`,
    ],
  },
  {
    key: 'passenger', label: 'Passenger', group: 'Ships', color: '#1c7ed6', stroke: '#0f4c8a', rotate: true, scale: 1.15,
    codes: [[60, 69]], names: ['passenger', 'ferry', 'cruise', 'ro-pax'],
    body: hull({ top: 2.5, bottom: 29.5, hb: 6.2, bow: 8.5, r: 4 }),
    details: [
      `<rect x="11.6" y="9.2" width="8.8" height="16.6" rx="4.2" fill="${WHITE}"/>`,
      `<rect x="13.6" y="11.4" width="4.8" height="12.2" rx="2.4" fill="#1c7ed6" opacity="0.55"/>`,
      `<circle cx="16" cy="21" r="1.5" fill="#0f4c8a"/>`,
    ],
  },
  {
    key: 'high-speed', label: 'High speed craft', group: 'Ships', color: '#f5b800', stroke: '#8a6400', rotate: true, scale: 0.85,
    codes: [[40, 49]], names: ['high speed', 'hsc', 'hydrofoil'],
    body: [
      hull({ cx: 11.4, top: 4, bottom: 28, hb: 2.4, bow: 6.5, r: 1 }),
      hull({ cx: 20.6, top: 4, bottom: 28, hb: 2.4, bow: 6.5, r: 1 }),
      'M10.4 12.5H21.6V25.4Q21.6 26.4 20.6 26.4H11.4Q10.4 26.4 10.4 25.4Z',
    ].join(' '),
    details: [
      `<path d="M11.6 15.4Q16 12.2 20.4 15.4" stroke="#5c4300" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,
      `<rect x="12.6" y="17.4" width="6.8" height="6.6" rx="1.4" fill="${WHITE}"/>`,
    ],
  },
  {
    key: 'fishing', label: 'Fishing', group: 'Ships', color: '#f0794a', stroke: '#9c3f1a', rotate: true, scale: 0.75,
    codes: [30], names: ['fishing', 'trawler'],
    body: hull({ top: 6.5, bottom: 26.5, hb: 4.6, bow: 5.6 }),
    details: [
      `<path d="M16 17L5.2 12.6M16 17L26.8 12.6" stroke="#5e2a12" stroke-width="1.3" stroke-linecap="round"/>`,
      `<circle cx="5.2" cy="12.6" r="1.5" fill="#5e2a12"/>`,
      `<circle cx="26.8" cy="12.6" r="1.5" fill="#5e2a12"/>`,
      `<rect x="13" y="11.4" width="6" height="4" rx="1" fill="${WHITE}"/>`,
      `<path d="M13 21.5H19" stroke="${SHADE}" stroke-width="1.2" stroke-linecap="round"/>`,
    ],
    // The booms reach past the hull: give them a halo too.
    haloExtra: `<path d="M16 17L5.2 12.6M16 17L26.8 12.6" stroke-width="4"/><circle cx="5.2" cy="12.6" r="2.6"/><circle cx="26.8" cy="12.6" r="2.6"/>`,
  },
  {
    key: 'tug', label: 'Tug and towing', group: 'Ships', color: '#0ca678', stroke: '#065c42', rotate: true, scale: 0.65,
    codes: [31, 32, 52], names: ['tug', 'towing', 'tow'],
    body: hull({ top: 6, bottom: 26, hb: 6, bow: 4.5, r: 3, blunt: 2.4 }),
    strokeWidth: 2,
    details: [
      `<rect x="12.6" y="9.6" width="6.8" height="6" rx="1.4" fill="${WHITE}"/>`,
      `<circle cx="16" cy="21.4" r="1.7" fill="none" stroke="#043d2c" stroke-width="1.2"/>`,
    ],
  },
  {
    key: 'pilot', label: 'Pilot', group: 'Ships', color: '#ffffff', stroke: '#c92a2a', rotate: true, scale: 0.65,
    codes: [50], names: ['pilot'],
    body: hull({ top: 6, bottom: 26.5, hb: 4.6, bow: 6 }),
    details: [
      // The pilot flag: white over red.
      `<path d="M11.4 17.2H20.6V25Q20.6 26.5 19.1 26.5H12.9Q11.4 26.5 11.4 25Z" fill="#e03131"/>`,
      `<rect x="13.4" y="11.2" width="5.2" height="4" rx="1" fill="#c92a2a" opacity="0.75"/>`,
    ],
  },
  {
    key: 'sar', label: 'Search and rescue', group: 'Ships', color: '#fd7e14', stroke: '#a14a00', rotate: true, scale: 0.7,
    codes: [51], names: ['search and rescue', 'sar', 'rescue', 'lifeboat', 'coast guard'],
    body: hull({ top: 4.5, bottom: 27.5, hb: 5.2, bow: 6.6 }),
    clipDetails: true,
    details: [
      `<path d="M8 21.5L24 12.5V16.4L8 25.4Z" fill="${WHITE}"/>`,
      `<rect x="13.2" y="18.6" width="5.6" height="5" rx="1.2" fill="#a14a00" opacity="0.55"/>`,
    ],
  },
  {
    key: 'law', label: 'Law enforcement', group: 'Ships', color: '#1f3f99', stroke: '#0c1d4f', rotate: true, scale: 0.75,
    codes: [55], names: ['law enforcement', 'police', 'patrol', 'customs'],
    body: hull({ top: 4.5, bottom: 27.5, hb: 5.2, bow: 6.6 }),
    clipDetails: true,
    details: [
      `<path d="M8 20L24 11V14.2L8 23.2Z" fill="${WHITE}"/>`,
      `<path d="M8 24.6L24 15.6V17L8 26Z" fill="#ff6b6b"/>`,
    ],
  },
  {
    key: 'military', label: 'Military', group: 'Ships', color: '#66727f', stroke: '#2b323a', rotate: true, scale: 1.05,
    codes: [35], names: ['military', 'naval', 'navy', 'warship'],
    body: 'M16 1.8L21.2 9.4V26.8L19.2 30H12.8L10.8 26.8V9.4Z',
    details: [
      `<circle cx="16" cy="8.4" r="1.4" fill="#2b323a"/>`,
      `<path d="M16 8.4V5.2" stroke="#2b323a" stroke-width="1.1" stroke-linecap="round"/>`,
      `<path d="M13 13.4H19L19.6 22.6H12.4Z" fill="${SOFT}"/>`,
      `<path d="M14.6 15.6H17.4V19.6H14.6Z" fill="#2b323a" opacity="0.6"/>`,
    ],
  },
  {
    key: 'sailing', label: 'Sailing', group: 'Ships', color: '#7950f2', stroke: '#3d1f9e', rotate: true, scale: 0.65,
    codes: [36], names: ['sailing', 'sail', 'yacht'],
    body: hull({ top: 5, bottom: 27.5, hb: 4.2, bow: 8, r: 2.2 }),
    details: [
      `<path d="M16 11.2C21.8 14.6 22.8 20 21.2 25.4L16 25.4Z" fill="${WHITE}"/>`,
      `<circle cx="16" cy="11.2" r="1.2" fill="#3d1f9e"/>`,
      `<path d="M16 11.2V25.4" stroke="#3d1f9e" stroke-width="1"/>`,
    ],
    haloExtra: `<path d="M16 11.2C21.8 14.6 22.8 20 21.2 25.4L16 25.4Z" stroke-width="3"/>`,
  },
  {
    key: 'pleasure', label: 'Pleasure craft', group: 'Ships', color: '#d6336c', stroke: '#7d1438', rotate: true, scale: 0.6,
    codes: [37], names: ['pleasure', 'motor yacht', 'recreational'],
    body: hull({ top: 8, bottom: 25.5, hb: 4, bow: 5.6, r: 2 }),
    details: [
      `<path d="M12.8 14.6Q16 12 19.2 14.6" stroke="${WHITE}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      `<rect x="13.2" y="17.2" width="5.6" height="5.6" rx="1.6" fill="${SOFT}"/>`,
    ],
  },
  {
    key: 'special', label: 'Special craft', group: 'Ships', color: '#15aabf', stroke: '#0a5a66', rotate: true, scale: 0.85,
    codes: [33, 34, 53, 54, 56, 57, 58, 59],
    names: ['dredging', 'dredger', 'diving', 'port tender', 'anti-pollution', 'medical', 'research', 'survey', 'cable', 'buoy tender', 'icebreaker', 'special'],
    body: hull({ top: 3.5, bottom: 28.5, hb: 5.4, bow: 6.4 }),
    details: [
      `<path d="M16 12.4L25.6 7.6" stroke="#06383f" stroke-width="1.5" stroke-linecap="round"/>`,
      `<circle cx="16" cy="12.4" r="2.2" fill="${WHITE}" stroke="#06383f" stroke-width="1"/>`,
      `<rect x="12" y="17.4" width="8" height="2.2" rx="0.6" fill="${SOFT}"/>`,
      `<rect x="11.6" y="22.8" width="8.8" height="3.6" rx="0.8" fill="${WHITE}"/>`,
    ],
    haloExtra: `<path d="M16 12.4L25.6 7.6" stroke-width="4"/>`,
  },
  {
    key: 'wig', label: 'Wing in ground', group: 'Ships', color: '#74b816', stroke: '#3b5e0b', rotate: true, scale: 0.7,
    codes: [[20, 29]], names: ['wing in ground', 'wig', 'ekranoplan'],
    body: [
      hull({ top: 4, bottom: 28, hb: 3.2, bow: 6, r: 1.4 }),
      'M4.6 18.4L12.8 13.4H19.2L27.4 18.4V20.6H4.6Z',
      'M10.6 28V25.6L12.8 24.4H19.2L21.4 25.6V28Z',
    ].join(' '),
    details: [`<path d="M14.4 9.6Q16 8.4 17.6 9.6" stroke="${WHITE}" stroke-width="1.2" fill="none"/>`],
  },
  {
    key: 'other', label: 'Other ship', group: 'Ships', color: '#5c6670', stroke: '#22282e', rotate: true, scale: 0.9,
    codes: [[90, 99], [1, 19], [38, 39]], names: ['other', 'reserved'],
    body: hull({ top: 4, bottom: 28, hb: 5.2, bow: 7 }),
    details: [`<rect x="12.4" y="21.4" width="7.2" height="3.6" rx="0.8" fill="${SOFT}"/>`],
  },
  {
    key: 'unknown', label: 'Unknown type', group: 'Ships', color: '#a7b1bb', stroke: '#4a535c', rotate: true, scale: 0.8,
    codes: [0], names: ['unknown', 'not available'],
    body: hull({ top: 4, bottom: 28, hb: 5.2, bow: 7 }),
    details: [`<path d="M16 10.6V22" stroke="${SHADE}" stroke-width="1.4" stroke-linecap="round"/>`],
  },
  {
    key: 'class-b', label: 'Small craft (class B)', group: 'Ships', color: '#a7b1bb', stroke: '#4a535c', rotate: true, scale: 0.6,
    codes: [], names: ['class b', 'small craft', 'tender'],
    body: hull({ top: 8.5, bottom: 24, hb: 3.6, bow: 5, r: 1.6 }),
    details: [`<rect x="13.8" y="16.2" width="4.4" height="4.4" rx="1.2" fill="${SOFT}"/>`],
  },

  // Not ships.
  {
    key: 'aton', label: 'Aid to navigation (buoy)', group: 'Aids and stations', color: '#fcc419', stroke: '#5c4400', rotate: false, scale: 0.7,
    names: ['aid to navigation', 'aton', 'buoy', 'light vessel', 'lightship'],
    // A pillar buoy afloat: wide float, slim body, cone topmark, light.
    body: 'M8.6 22.6Q16 27 23.4 22.6L21.4 19.4H10.6Z M13.2 19.4L14.4 11H17.6L18.8 19.4Z',
    details: [
      `<path d="M13.9 15.4H18.1" stroke="#5c4400" stroke-width="1.7"/>`,
      `<path d="M16 11V8.6" stroke="#5c4400" stroke-width="1.3"/>`,
      `<path d="M13.8 8.6L16 4.8L18.2 8.6Z" fill="#5c4400"/>`,
      `<path d="M6.4 26.6Q8.3 25.2 10.2 26.6T14 26.6T17.8 26.6T21.6 26.6T25.4 26.6" stroke="#1c7ed6" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      `<path d="M21.4 8.2L24.8 6.6M21.8 11.2H25.6M10.6 8.2L7.2 6.6M10.2 11.2H6.4" stroke="#f08c00" stroke-width="1.3" stroke-linecap="round"/>`,
    ],
    haloExtra: `<path d="M13.8 8.6L16 4.8L18.2 8.6Z" stroke-width="3"/><path d="M6.4 26.6H25.4" stroke-width="4"/>`,
  },
  {
    key: 'aton-fixed', label: 'Aid to navigation (fixed light or beacon)', group: 'Aids and stations', color: '#fcc419', stroke: '#5c4400', rotate: false, scale: 0.75,
    names: ['lighthouse', 'beacon', 'fixed structure', 'racon', 'light'],
    body: 'M11.4 27.4L13.4 12.8H18.6L20.6 27.4Z M12.8 12.8V9.8H19.2V12.8Z M13.6 9.8L16 6.8L18.4 9.8Z',
    details: [
      `<path d="M12.6 18.6L19.4 17.4M12 23.6L20 22.2" stroke="#e03131" stroke-width="2"/>`,
      `<rect x="14.2" y="10.4" width="3.6" height="1.8" fill="#fff3bf"/>`,
      `<path d="M21.6 9.4L26.6 7.6M21.6 11.6L26.6 13.4M10.4 9.4L5.4 7.6M10.4 11.6L5.4 13.4" stroke="#f08c00" stroke-width="1.3" stroke-linecap="round"/>`,
    ],
  },
  {
    key: 'aton-virtual', label: 'Virtual aid to navigation', group: 'Aids and stations', color: 'none', stroke: '#e8a200', rotate: false, scale: 0.7,
    names: ['virtual aid', 'virtual aton', 'virtual'],
    body: 'M16 5.4L26.6 16L16 26.6L5.4 16Z',
    strokeWidth: 1.8,
    dash: '2.6 1.8',
    details: [
      `<circle cx="16" cy="16" r="3.2" fill="#fcc419" stroke="#5c4400" stroke-width="1"/>`,
      `<path d="M16 9.8V12.4M16 19.6V22.2M9.8 16H12.4M19.6 16H22.2" stroke="#5c4400" stroke-width="1.2" stroke-linecap="round"/>`,
    ],
  },
  {
    key: 'base-station', label: 'AIS base station', group: 'Aids and stations', color: '#3b5bdb', stroke: '#1c2f80', rotate: false, scale: 0.8,
    names: ['base station', 'coast station', 'shore station'],
    body: 'M14.8 12.6H17.2L21.4 27.6H18.8L16 17.4L13.2 27.6H10.6Z',
    details: [
      `<path d="M13 24H19M14 20.4H18" stroke="#1c2f80" stroke-width="1.2"/>`,
      `<circle cx="16" cy="10.6" r="2.4" fill="#3b5bdb" stroke="#1c2f80" stroke-width="1"/>`,
      `<path d="M11.4 6.6Q9.4 10.6 11.4 14.6M20.6 6.6Q22.6 10.6 20.6 14.6" stroke="#3b5bdb" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      `<path d="M8.2 4.4Q5 10.6 8.2 16.8M23.8 4.4Q27 10.6 23.8 16.8" stroke="#3b5bdb" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.7"/>`,
    ],
    haloExtra: `<path d="M11.4 6.6Q9.4 10.6 11.4 14.6M20.6 6.6Q22.6 10.6 20.6 14.6M8.2 4.4Q5 10.6 8.2 16.8M23.8 4.4Q27 10.6 23.8 16.8" stroke-width="4" fill="none"/>`,
  },
  {
    key: 'sar-aircraft', label: 'Search and rescue aircraft', group: 'Aids and stations', color: '#fd7e14', stroke: '#8a3c00', rotate: true, scale: 0.75,
    names: ['sar aircraft', 'search and rescue aircraft', 'helicopter'],
    body: 'M16 3C17.1 3 17.6 4.2 17.6 5.6V11.8L27.6 17.2V19.6L17.6 17V23.6L21 26.2V28.2L16 27L11 28.2V26.2L14.4 23.6V17L4.4 19.6V17.2L14.4 11.8V5.6C14.4 4.2 14.9 3 16 3Z',
    details: [
      `<path d="M14.6 13.4H17.4" stroke="${WHITE}" stroke-width="1.6"/>`,
      `<path d="M8 16.6L10.6 15.2M24 16.6L21.4 15.2" stroke="${WHITE}" stroke-width="1.4" stroke-linecap="round"/>`,
    ],
  },
  {
    key: 'sart', label: 'AIS-SART (survival craft)', group: 'Emergency', color: '#f03e3e', stroke: '#7a0f0f', rotate: false, scale: 0.8,
    names: ['sart', 'ais-sart', 'survival craft'],
    body: 'M16 6A10 10 0 1 1 15.99 6Z M16 9.6A6.4 6.4 0 1 0 16.01 9.6Z',
    details: [
      `<path d="M11.6 11.6L20.4 20.4M20.4 11.6L11.6 20.4" stroke="#f03e3e" stroke-width="2.4" stroke-linecap="round"/>`,
      `<circle cx="16" cy="16" r="2" fill="#7a0f0f"/>`,
    ],
  },
  {
    key: 'mob', label: 'Man overboard (MOB)', group: 'Emergency', color: '#f03e3e', stroke: '#7a0f0f', rotate: false, scale: 0.8,
    names: ['mob', 'man overboard', 'person in water'],
    body: 'M16 5.4A10.6 10.6 0 1 1 15.99 5.4Z',
    details: [
      // A person in the water, arms up.
      `<circle cx="16" cy="13.6" r="2.3" fill="#ffffff"/>`,
      `<path d="M11.4 9.6L13.6 15.4Q16 17.2 18.4 15.4L20.6 9.6" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      `<path d="M8.6 20Q10.45 18.6 12.3 20T16 20T19.7 20T23.4 20" stroke="#ffffff" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
    ],
  },
  {
    key: 'epirb', label: 'EPIRB (AIS distress beacon)', group: 'Emergency', color: '#f03e3e', stroke: '#7a0f0f', rotate: false, scale: 0.8,
    names: ['epirb', 'distress beacon', 'plb'],
    body: 'M13 12.4H19V26.2Q19 27.6 17.6 27.6H14.4Q13 27.6 13 26.2Z M15.2 12.4V4.4H16.8V12.4Z',
    details: [
      `<rect x="13" y="16.6" width="6" height="2.4" fill="#ffd43b"/>`,
      `<path d="M10 8.6Q8.6 12 10 15.4M22 8.6Q23.4 12 22 15.4M7.2 6.6Q5 12 7.2 17.4M24.8 6.6Q27 12 24.8 17.4" stroke="#f03e3e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    ],
    haloExtra: `<path d="M10 8.6Q8.6 12 10 15.4M22 8.6Q23.4 12 22 15.4M7.2 6.6Q5 12 7.2 17.4M24.8 6.6Q27 12 24.8 17.4" stroke-width="4.2" fill="none"/>`,
  },
];

/** One icon as a standalone SVG document. */
export function iconSvg(icon, { size = 32, halo = true } = {}) {
  const sw = icon.strokeWidth ?? 1.2;
  const dash = icon.dash ? ` stroke-dasharray="${icon.dash}"` : '';
  const clipId = `c-${icon.key}`;
  const parts = [];
  if (halo) {
    // A light outline keeps the icon readable on dark and satellite maps and
    // separates icons that overlap.
    parts.push(
      `<g fill="#fff" stroke="#fff" stroke-linejoin="round" stroke-linecap="round" opacity="0.92">` +
        `<path d="${icon.body}" stroke-width="${sw + 2.6}"/>` +
        (icon.haloExtra ?? '') +
        `</g>`,
    );
  }
  if (icon.clipDetails) parts.push(`<defs><clipPath id="${clipId}"><path d="${icon.body}"/></clipPath></defs>`);
  // Details that reach outside the hull (booms, cranes, arcs) go under it.
  parts.push(
    `<path d="${icon.body}" fill="${icon.color}" fill-rule="evenodd" stroke="${icon.stroke}" stroke-width="${sw}" stroke-linejoin="round"${dash}/>`,
  );
  const details = icon.details.join('');
  parts.push(icon.clipDetails ? `<g clip-path="url(#${clipId})">${details}</g>` : details);
  // Redraw the outline over clipped details so their edges stay crisp.
  if (icon.clipDetails)
    parts.push(`<path d="${icon.body}" fill="none" stroke="${icon.stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">${parts.join('')}</svg>`;
}
