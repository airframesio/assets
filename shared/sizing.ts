
// ── Sizing by zoom and by real size ──────────────────────────────────────────
// (This part is shared/sizing.ts, added to both the aircraft and marine
// modules by their builds, so an app can import it from either.)

/**
 * How big icons draw at each zoom level, as a factor of the app's base size
 * (1 at zoom 8). Zoomed out they shrink so a busy world view stays readable;
 * zoomed in they grow. The outline and halo are part of the image, so their
 * thickness follows. Zoom levels are MapLibre's (512 px tiles); OpenLayers
 * and other 256 px tile maps are one level higher for the same scale.
 */
export const ICON_ZOOM_STOPS: readonly (readonly [zoom: number, factor: number])[] = [
  [1, 0.5],
  [3, 0.6],
  [5, 0.74],
  [8, 1],
  [11, 1.25],
  [14, 1.5],
  [17, 1.75],
];

/** The zoom factor from ICON_ZOOM_STOPS at a MapLibre zoom level. */
export function iconZoomFactor(zoom: number): number {
  const s = ICON_ZOOM_STOPS;
  if (!(zoom > s[0][0])) return s[0][1];
  for (let i = 1; i < s.length; i++) {
    const [z1, f1] = s[i];
    if (zoom <= z1) {
      const [z0, f0] = s[i - 1];
      return f0 + ((f1 - f0) * (zoom - z0)) / (z1 - z0);
    }
  }
  return s[s.length - 1][1];
}

/**
 * Share of the 32 px image that `meters` covers in the true-size helpers.
 * aircraftSizeMeters() and marineSizeMeters() scale each craft's real size by
 * its icon's own drawn span, so the drawing itself covers the real size.
 */
export const ICON_DRAWN_SHARE = 0.85;

/** Real meters scaled so a drawing `span` grid units wide covers them at ICON_DRAWN_SHARE. */
function drawnMeters(meters: number, span: number | undefined): number {
  return span && span > 1 ? (meters * 32 * ICON_DRAWN_SHARE) / span : meters;
}

const EARTH_CIRCUMFERENCE = 40075016.686;

/**
 * A craft's size in Web Mercator meters (meters / cos(latitude)), for the
 * `meters` property that iconSizeExpression() and trueIconSize() read. Null
 * when the size is unknown.
 */
export function mercatorMeters(meters: number | null | undefined, latitude: number): number | null {
  if (meters == null || !(meters > 0)) return null;
  const c = Math.cos((Math.max(-85, Math.min(85, latitude)) * Math.PI) / 180);
  return meters / c;
}

/**
 * The icon scale at which the drawing covers the craft's real size on the
 * map: `mercMeters` from mercatorMeters(), `metersPerPixel` the map's
 * resolution in Mercator meters (OpenLayers `resolution`), `iconPx` the
 * image's drawn size in CSS pixels at scale 1.
 */
export function trueIconSize(mercMeters: number | null | undefined, metersPerPixel: number, iconPx = 32): number {
  if (!mercMeters || !(metersPerPixel > 0)) return 0;
  return mercMeters / (metersPerPixel * iconPx * ICON_DRAWN_SHARE);
}

/**
 * A MapLibre/Mapbox `icon-size` expression: `base` x ICON_ZOOM_STOPS x the
 * feature's `scale` property, and from zoom 12 never smaller than the craft's
 * real size (the feature's `meters` property, from mercatorMeters(); leave it
 * out or 0 when unknown), so a 747 at the gate covers its real footprint.
 * `iconPx` is the image's size in CSS pixels at icon-size 1.
 */
export function iconSizeExpression(
  base = 1,
  options: { scaleProp?: string; metersProp?: string; iconPx?: number; trueSize?: boolean } = {},
): unknown[] {
  const { scaleProp = 'scale', metersProp = 'meters', iconPx = 32, trueSize = true } = options;
  const scale = ['coalesce', ['get', scaleProp], 1];
  const meters = ['coalesce', ['get', metersProp], 0];
  const stops: unknown[] = [];
  const zooms = [...ICON_ZOOM_STOPS.map(([z]) => z).filter((z) => z < 12), 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  for (const z of zooms) {
    const zoomed = ['*', +(base * iconZoomFactor(z)).toFixed(4), scale];
    if (!trueSize || z < 12) {
      stops.push(z, zoomed);
      continue;
    }
    // Icon-size 1 draws iconPx CSS px; a MapLibre pixel is C / (512 * 2^z) meters.
    const perMeter = (512 * 2 ** z) / (EARTH_CIRCUMFERENCE * iconPx * ICON_DRAWN_SHARE);
    stops.push(z, ['max', zoomed, ['*', +perMeter.toPrecision(5), meters]]);
  }
  return ['interpolate', ['linear'], ['zoom'], ...stops];
}
