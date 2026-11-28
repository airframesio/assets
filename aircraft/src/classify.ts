// ── Choosing an icon ─────────────────────────────────────────────────────────
// (This part is copied from aircraft/src/classify.ts by the build.)

/** What a map knows about an aircraft. Every field is optional. */
export interface AircraftTarget {
  /** ICAO aircraft type designator, such as "B738", "A359" or "H145". */
  type?: string | null;
  /** ADS-B emitter category: "A3", "B6", ... (also "a3" or the DO-260 set/number pair). */
  category?: string | number | null;
  /** True for military aircraft; picks the military icons when the type is unknown. */
  military?: boolean | null;
}

const Q = 'quad', W = 'widebody', N = 'airliner', R = 'regional', T = 'turboprop', J = 'bizjet', L = 'light', L2 = 'light-twin', H = 'helicopter', F = 'fighter', M = 'military-transport', D = 'drone';

const TYPE_LIST: Record<string, string> = {
  // Narrow-body twins
  [N]: 'B731 B732 B733 B734 B735 B736 B737 B738 B739 B37M B38M B39M B3XM A318 A319 A320 A321 A19N A20N A21N B752 B753 B712 B721 B722 MD80 MD81 MD82 MD83 MD87 MD88 MD90 DC93 DC95 C919 MC21 BCS1 BCS3 E295 P8 E737 T204',
  // Wide-body twins and three-engine jets
  [W]: 'B762 B763 B764 B772 B773 B77L B77W B778 B779 B77F B788 B789 B78X A306 A30B A310 A332 A333 A337 A338 A339 A359 A35K DC10 MD11 L101 KC10 KC46 B76F A33F A3ST',
  // Four engines
  [Q]: 'B741 B742 B743 B744 B748 B74S B74F A342 A343 A345 A346 A380 A388 IL96 IL62 IL76 AN124 A124 AN225 A225 C17 C5 C5M B52 E3CF E3TF E6 E6B K35R KC35 RC35 C135 E767 B461 B462 B463 RJ70 RJ85 RJ1H VC10 A400 CONC',
  // Regional jets
  [R]: 'CRJ1 CRJ2 CRJ7 CRJ9 CRJX E135 E145 E35L E170 E175 E190 E195 E290 E75L E75S F70 F100 ARJ2 AJ27 SU95 J328',
  // Turboprop airliners
  [T]: 'AT43 AT44 AT45 AT72 AT73 AT75 AT76 DH8A DH8B DH8C DH8D DHC6 DHC7 SF34 JS31 JS32 JS41 SW4 B190 BE99 L410 D228 D328 C212 CN35 C295 AN24 AN26 AN28 AN30 AN32 AN72 AN12 IL18 Y12 MA60 F50 F27 SH36 SB37 SB20 E120',
  // Business jets
  [J]: 'C25A C25B C25C C25M C500 C501 C510 C525 C550 C551 C55B C560 C56X C650 C680 C68A C700 C750 CL30 CL35 CL60 GL5T GL6T GL7T GL8T GLEX GLF2 GLF3 GLF4 GLF5 GLF6 GA5C GA6C GA7C GA8C GALX G150 G200 G280 LJ23 LJ24 LJ25 LJ28 LJ31 LJ35 LJ40 LJ45 LJ55 LJ60 LJ70 LJ75 FA10 FA20 FA50 FA6X FA7X FA8X F900 F2TH H25A H25B H25C HA4T E50P E55P E545 E550 PRM1 EA50 SF50 BE40 BE4W HDJT ASTR WW24 PC24',
  // Light singles (piston and single turboprop)
  [L]: 'C150 C152 C162 C170 C172 C175 C177 C180 C182 C185 C195 C206 C207 C208 C210 P210 T206 PA18 PA20 PA22 PA24 PA25 PA28 P28A P28B P28R P28T PA32 P32R PA46 PA38 BE33 BE35 BE36 BE23 BE24 M20P M20T M20J DA20 DA40 DV20 SR20 SR22 S22T TBM7 TBM8 TBM9 PC12 PC6T PC9 PC21 PC7 RV4 RV6 RV7 RV8 RV9 RV10 RV12 AA5 GLAS C77R AT3T AT8T AT5T M600 KODI EPIC CH60 G115 G120 PA36 PA11 J3 CUB2 SR21 EVOT T6',
  // Piston and small turboprop twins
  [L2]: 'BE55 BE58 BE60 BE76 BE95 BE9L BE9T BE20 BE30 BE35T PA23 PA27 PA30 PA31 PA34 PA44 PA60 P68 C303 C310 C320 C335 C340 C402 C404 C414 C421 C425 C441 DA42 DA62 B350 AC90 AC95 AEST MU2 PAY1 PAY2 PAY3 PAY4 P180 BN2P TWEN',
  // Rotorcraft
  [H]: 'EC20 EC25 EC30 EC35 EC45 EC55 EC75 H120 H125 H130 H135 H145 H155 H160 H175 H215 H225 AS32 AS50 AS55 AS65 AS3B A109 A119 A139 A149 A169 A189 AW09 B06 B06T B105 BK17 B212 B214 B222 B230 B407 B412 B427 B429 B430 B505 B525 S76 S92 S61 S64 S70 H60 UH60 MH60 AH64 AH1 H64 CH47 H47 CH53 H53 V22 MI8 MI17 MI24 MI26 MI28 KA27 KA32 K32 KA52 MD52 MD60 EXPL R22 R44 R66 GYRO NH90 LYNX PUMA ALO3 UH1 H1',
  // Fast jets, trainers and other military fixed-wing
  [F]: 'F16 F15 F18 F18S FA18 F22 F35 F14 F4 F5 A10 B1 B2 EUFI TYPH RFAL GRIF J10 J11 SU27 SU30 SU34 SU35 SU57 MG29 MG31 TOR T38 T45 HAWK M346 L39 AMX MIR2 U2 SR71 A4 AV8B HAR K8',
  // Military transports, tankers and patrol aircraft with propellers or high wings
  [M]: 'C130 C30J HRC1 P3 P3C CP14 C160 C27J G222 E2 C2 KC2 AN22 C12 U21',
  // Drones
  [D]: 'RQ4 MQ9 MQ1 Q4 Q9 TB2 UAV DRON',
  // Others by ICAO designator
  glider: 'GLID',
  airship: 'SHIP BALL',
  ultralight: 'ULAC',
};

const TYPES: Record<string, AircraftIconKey> = {};
for (const [key, list] of Object.entries(TYPE_LIST)) for (const t of list.split(' ')) TYPES[t] = key as AircraftIconKey;

/** Family prefixes, checked when the exact designator is not listed (longest first). */
const PREFIXES: [string, AircraftIconKey][] = [
  ['B74', 'quad'], ['A34', 'quad'], ['A38', 'quad'],
  ['B73', 'airliner'], ['B3', 'airliner'], ['A31', 'airliner'], ['A32', 'airliner'], ['B75', 'airliner'],
  ['B76', 'widebody'], ['B77', 'widebody'], ['B78', 'widebody'], ['A33', 'widebody'], ['A35', 'widebody'],
  ['CRJ', 'regional'], ['E17', 'regional'], ['E19', 'regional'],
  ['AT', 'turboprop'], ['DH8', 'turboprop'], ['SF', 'turboprop'],
  ['GLF', 'bizjet'], ['GL', 'bizjet'], ['LJ', 'bizjet'], ['FA', 'bizjet'], ['C5', 'bizjet'], ['C6', 'bizjet'], ['C7', 'bizjet'],
  ['EC', 'helicopter'], ['AS3', 'helicopter'], ['AS5', 'helicopter'], ['AS6', 'helicopter'], ['MI', 'helicopter'], ['R4', 'helicopter'], ['R6', 'helicopter'],
  ['PA', 'light'], ['P28', 'light'], ['C1', 'light'], ['C2', 'light'], ['SR', 'light'], ['DA', 'light'], ['RV', 'light'], ['BE3', 'light'],
  ['SU', 'fighter'],
];

const ADSB: Record<string, AircraftIconKey> = {};
for (const i of AIRCRAFT_ICON_LIST) for (const c of i.adsb) ADSB[c] = i.key;

/** ADS-B emitter category as "A3": accepts "a3", "A3", "3" with set "A", or DO-260 numbers like 0xA3. */
function emitterCategory(c: string | number | null | undefined): string | null {
  if (c == null || c === '') return null;
  if (typeof c === 'number') return c >= 0xa0 && c <= 0xdf ? c.toString(16).toUpperCase() : null;
  const s = c.trim().toUpperCase();
  return /^[A-D][0-7]$/.test(s) ? s : null;
}

/** The icon for an aircraft. Never throws; unknown aircraft get the `unknown` icon. */
export function aircraftIconKey(target: AircraftTarget): AircraftIconKey {
  const t = target.type?.trim().toUpperCase();
  if (t) {
    const exact = TYPES[t];
    if (exact) return exact;
    for (const [p, key] of PREFIXES) if (t.startsWith(p)) return key;
  }
  const cat = ADSB[emitterCategory(target.category) ?? ''];
  if (cat) return target.military && (cat === 'airliner' || cat === 'widebody') ? 'military-transport' : cat;
  return target.military ? 'fighter' : 'unknown';
}

/** What a map knows about a balloon flight. */
export interface BalloonTarget {
  /** Vertical rate in m/s (positive when rising). */
  verticalRate?: number | null;
  /** True once the payload is on the ground (or its last report is old and low). */
  landed?: boolean | null;
}

/** The icon for a radiosonde or high-altitude balloon: rising, falling or landed. */
export function balloonIconKey(target: BalloonTarget): AircraftIconKey {
  if (target.landed) return 'landed';
  if (target.verticalRate != null && target.verticalRate < -1) return 'parachute';
  return 'balloon';
}

/** True when the map should turn the icon by track or heading (it points north). */
export function aircraftIconRotates(key: AircraftIconKey): boolean {
  return AIRCRAFT_ICONS[key]?.rotate ?? false;
}

// Wingspans in meters by ICAO type designator (rotor diameter for
// helicopters), from manufacturer data, for the common types on the map.
// Winglet and sharklet versions use the larger span.
const SPAN_LIST: [number, string][] = [
  [79.8, 'A388 A380'], [88.4, 'A225 AN225'], [73.3, 'A124 AN124'], [68.4, 'B748'], [64.4, 'B744 B74F B74S'], [59.6, 'B741 B742 B743'],
  [71.8, 'B778 B779'], [64.8, 'B77L B77W B77F A359 A35K'], [60.9, 'B772 B773'], [60.1, 'B788 B789 B78X'],
  [64, 'A338 A339'], [60.3, 'A332 A333 A337 A33F A342 A343 KC30 MRTT'], [63.5, 'A345 A346'],
  [51.9, 'B764'], [50.9, 'B762 B763 B76F'], [44.8, 'A306 A30B'], [43.9, 'A310'], [51.7, 'MD11'], [50.4, 'DC10 KC10'],
  [48.1, 'KC46'], [41.1, 'B752 B753 C32'], [35.9, 'B37M B38M B39M B3XM'], [35.8, 'B737 B738 B739 BBJ1 BBJ2 C40 A319 A320 A321 A19N A20N A21N C919'],
  [37.6, 'P8'], [34.3, 'B736'], [34.1, 'A318'], [28.9, 'B733 B734 B735'], [28.4, 'B731 B732'], [32.9, 'MD80 MD81 MD82 MD83 MD87 MD88 MD90'],
  [28.5, 'B712'], [35.1, 'BCS1 BCS3 E295'], [33.7, 'E290'], [28.7, 'E190 E195 C27J'], [26, 'E170'], [28.7, 'E175 E75L'], [26, 'E75S'],
  [20, 'E135 E145 E35L'], [21.2, 'CRJ1 CRJ2'], [23.2, 'CRJ7'], [24.9, 'CRJ9'], [26.2, 'CRJX'], [27.8, 'SU95'], [27.3, 'AJ27 ARJ2'],
  [28.1, 'F70 F100'], [26.3, 'RJ70 RJ85 RJ1H B461 B462 B463'], [29, 'F50 F27'], [27.1, 'AT72 AT73 AT75 AT76'], [24.6, 'AT43 AT44 AT45 AT46'],
  [28.4, 'DH8D'], [27.4, 'DH8C'], [25.9, 'DH8A DH8B'], [19.8, 'DHC6'], [21.4, 'SF34'], [24.8, 'SB20'], [18.3, 'JS41'], [15.9, 'JS31 JS32'],
  [17.7, 'B190 B350'], [16.6, 'BE20 BE30'], [15.3, 'BE9L BE9T'], [21, 'D328 J328'], [17, 'D228'], [19.5, 'L410'], [29.2, 'AN26 AN24 MA60'],
  [25.8, 'C295 CN35'], [40.4, 'C130 C30J HRC1'], [42.4, 'A400'], [51.8, 'C17'], [67.9, 'C5 C5M'], [50.5, 'IL76'], [38, 'AN12'],
  [39.9, 'K35R KC35 RC35 C135 RQ4'], [44.4, 'E3CF E3TF'], [45.2, 'E6 E6B'], [56.4, 'B52'], [30.4, 'P3 P3C CP14'], [24.6, 'E2 C2'],
  [42, 'B1'], [52.4, 'B2'], [20.1, 'MQ9'], [13, 'F15'], [13.6, 'F18 F18S FA18'], [10, 'F16'], [10.7, 'F35'], [13.6, 'F22'], [11, 'EUFI TYPH'],
  [10.9, 'RFAL'], [8.4, 'GRIF'], [17.5, 'A10'], [9.4, 'HAWK T45'], [8.2, 'T38'], [10.2, 'PC21 T6'],
  [31.7, 'GL7T GL8T'], [28.7, 'GLEX GL5T GL6T'], [30.4, 'GLF6 GA7C GA8C'], [28.5, 'GLF5 GA5C GA6C'], [23.7, 'GLF4 GLF3'], [19.2, 'G280'],
  [21, 'CL30 CL35'], [19.6, 'CL60'], [26.2, 'FA7X FA8X FA6X'], [19.3, 'F900 FA50'], [21.4, 'F2TH'], [16.3, 'FA20 FA10'],
  [22, 'C700 C68A'], [19.4, 'C750'], [17.2, 'C56X C560 C650 C680'], [15.9, 'C550 C551 C55B C501'], [15.5, 'C25B C25C C25M'], [14.4, 'C25A C525'],
  [13.2, 'C510'], [16.2, 'E55P E545 E550'], [12.3, 'E50P'], [17, 'PC24'], [15.7, 'H25B H25C H25A'], [14.6, 'LJ45 LJ40 LJ75 LJ70'], [13.4, 'LJ60 LJ55'],
  [12, 'LJ35 LJ31 LJ24 LJ25'], [13.6, 'BE40 PRM1'], [12.1, 'HDJT'], [11.8, 'SF50'],
  [16.3, 'PC12'], [15.9, 'C208'], [12.8, 'TBM7 TBM8 TBM9'], [14.1, 'PC6T'], [13.1, 'PA46 M600'], [12.8, 'KODI'],
  [11, 'C172 C170 C175 C177 C182 C180 C185 P210 C210'], [10.1, 'C150 C152 C162'], [11, 'C206 T206 C207'], [10.7, 'PA28 P28A P28B P28R P28T PA32 P32R'],
  [10.8, 'PA18 PA20 PA22 J3 CUB2'], [11.7, 'SR22 S22T SR20 SR21'], [11.6, 'DA40 DA42'], [10.8, 'DA20 DV20'], [14.6, 'DA62'], [10.2, 'BE33 BE35 BE36'],
  [11.5, 'BE55 BE58 BE95'], [11.6, 'BE76'], [11.9, 'PA34 PA44 PA30'], [12.4, 'PA31 PA23 PA27'], [11.3, 'C310 C320 C340'], [13.5, 'C402 C404 C414 C421'],
  [11, 'M20P M20T M20J'], [7.7, 'RV4 RV6 RV7 RV8 RV12'], [8.8, 'RV10 RV9'], [11.6, 'P68'], [14.9, 'BN2P'], [17, 'Y12'],
  [10.2, 'EC35 H135 B06 B06T EC30 H130'], [11, 'EC45 H145 BK17'], [10.7, 'AS50 H125 AS55 B407 B505'], [12.6, 'EC55 H155 AS65'], [14.8, 'EC75 H175 H160'],
  [16.2, 'EC25 H225 H215 AS32'], [13.8, 'A139 AW09'], [12.9, 'A169'], [14.6, 'A189'], [11, 'A109 A119'], [13.4, 'S76'], [17.2, 'S92'], [18.9, 'S61'],
  [16.4, 'H60 UH60 MH60 S70'], [14.6, 'AH64 H64'], [18.3, 'CH47 H47'], [24.1, 'CH53 H53'], [11.6, 'V22'], [21.3, 'MI8 MI17'], [17.3, 'MI24'], [32, 'MI26'],
  [14.6, 'B412 B212 UH1 H1'], [12.1, 'B429 B427 B430'], [10.1, 'R44'], [7.7, 'R22'], [10.1, 'R66'], [16.3, 'NH90'], [8.4, 'EC20 H120'],
  [15, 'GLID'], [10, 'ULAC'],
];
const SPANS: Record<string, number> = {};
for (const [m, list] of SPAN_LIST) for (const t of list.split(' ')) SPANS[t] ??= m;

/** The wingspan (rotor diameter for helicopters) in meters for an ICAO type designator, when listed. */
export function aircraftWingspan(type: string | null | undefined): number | null {
  const t = type?.trim().toUpperCase();
  return (t && SPANS[t]) || null;
}

/** A narrow-body airliner's span, which draws at scale 1. */
const BASE_SPAN = 35;

/**
 * Relative icon size (1 = a narrow-body airliner), for `icon-size` or a pixel
 * size. Pass the ICAO type designator to size listed types by their real
 * wingspan (on a log scale, so a Cessna is not a dot next to an A380);
 * others, and balloons, use their icon's size.
 */
export function aircraftIconScale(key: AircraftIconKey, type?: string | null): number {
  const icon = AIRCRAFT_ICONS[key];
  const span = icon?.balloon ? null : aircraftWingspan(type);
  if (span) return Math.min(1.5, Math.max(0.45, 1 + 0.9 * Math.log10(span / BASE_SPAN)));
  return icon?.scale ?? 1;
}

/**
 * The aircraft's real size in meters for true-scale drawing up close: the
 * listed wingspan, else a typical one for its icon. Null for balloons and
 * unknown aircraft.
 */
export function aircraftSizeMeters(key: AircraftIconKey, type?: string | null): number | null {
  const icon = AIRCRAFT_ICONS[key];
  if (!icon || icon.balloon || key === 'unknown') return null;
  return aircraftWingspan(type) ?? TYPICAL_SPANS[key] ?? null;
}

/** Typical spans (meters) for aircraft whose type is not listed. */
const TYPICAL_SPANS: Partial<Record<AircraftIconKey, number>> = {
  airliner: 35, widebody: 60, quad: 65, regional: 26, turboprop: 27, bizjet: 19, light: 11, 'light-twin': 12, glider: 15,
  ultralight: 10, helicopter: 11, drone: 15, airship: 20, fighter: 11, 'military-transport': 40, 'ground-vehicle': 6,
};

/** Darkens a #rrggbb color, for an outline that matches a custom fill. */
export function darkenColor(hex: string, amount = 0.5): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#222222';
  const n = parseInt(m[1], 16);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - amount)).toString(16).padStart(2, '0')).join('');
}

/**
 * The icon's SVG. Aircraft take a fill color (by altitude, basemap, ...) and an
 * outline, which defaults to a darker shade of the fill. Balloon icons keep
 * their own colors.
 */
export function aircraftIconSvg(key: AircraftIconKey, fill?: string | null, stroke?: string | null): string {
  const icon = AIRCRAFT_ICONS[key] ?? AIRCRAFT_ICONS.unknown;
  if (!fill || icon.balloon) return icon.svg;
  return icon.template.split('{{fill}}').join(fill).split('{{stroke}}').join(stroke || darkenColor(fill));
}

/** The icon as a data: URL, for <img> and Leaflet. */
export function aircraftIconDataUrl(key: AircraftIconKey, fill?: string | null, stroke?: string | null): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(aircraftIconSvg(key, fill, stroke));
}

/**
 * Renders icons to ImageData for MapLibre/Mapbox `map.addImage(id, data, { pixelRatio })`.
 * `fill` recolors the aircraft (balloons keep their colors). Browser only.
 */
export async function loadAircraftIconImages(
  options: { size?: number; pixelRatio?: number; fill?: string; stroke?: string; keys?: AircraftIconKey[] } = {},
): Promise<[AircraftIconKey, ImageData][]> {
  const { size = 32, pixelRatio = 2, fill, stroke } = options;
  const px = Math.round(size * pixelRatio);
  if (!Number.isFinite(px) || px <= 0) throw new RangeError(`icon size must be positive, got ${size} x ${pixelRatio}`);
  const keys = options.keys ?? AIRCRAFT_ICON_LIST.map((i) => i.key);
  return Promise.all(
    keys.map(
      (key) =>
        new Promise<[AircraftIconKey, ImageData]>((resolve, reject) => {
          const img = new Image(px, px);
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = px;
              canvas.height = px;
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('no 2d context'));
              ctx.drawImage(img, 0, 0, px, px);
              resolve([key, ctx.getImageData(0, 0, px, px)]);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error(`could not draw ${key}`));
          img.src = aircraftIconDataUrl(key, fill, stroke);
        }),
    ),
  );
}
