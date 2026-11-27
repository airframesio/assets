/** What we know about an AIS target. Every field is optional. */
export interface MarineTarget {
  /** MMSI, as a number or string. Its leading digits say what kind of station it is. */
  mmsi?: string | number | null;
  /**
   * AIS ship and cargo type (0-99), as a number or numeric string, or type text
   * ("Cargo", "Tanker - Hazard A", "Fishing vessel", ...). Airframes stores aids
   * to navigation as "aton:<aid type>" with ":virtual" added for virtual aids.
   */
  type?: string | number | null;
  /** AIS aid to navigation type (message 21, 0-31). */
  aidType?: number | null;
  /** True for a virtual aid to navigation (message 21). */
  virtual?: boolean | null;
  /** Transponder class, "A" or "B", when known. */
  transponderClass?: string | null;
  /** The AIS message type of the latest report (4, 9, 18, 21, ...), when known. */
  messageType?: number | null;
}

function inRange(code: number, codes: (number | [number, number])[]): boolean {
  return codes.some((c) => (Array.isArray(c) ? code >= c[0] && code <= c[1] : code === c));
}

/** The MMSI as nine digits (numeric MMSIs lose their leading zeros). */
export function normalizeMmsi(mmsi: string | number | null | undefined): string | null {
  if (mmsi == null) return null;
  const digits = String(mmsi).trim();
  if (!/^\d{1,9}$/.test(digits)) return null;
  return digits.padStart(9, '0');
}

/** The icon for an MMSI alone, for stations that are not ships (ITU-R M.585). */
export function marineIconKeyForMmsi(mmsi: string | number | null | undefined): MarineIconKey | null {
  const m = normalizeMmsi(mmsi);
  if (!m) return null;
  if (m.startsWith('970')) return 'sart';
  if (m.startsWith('972')) return 'mob';
  if (m.startsWith('974')) return 'epirb';
  if (m.startsWith('111')) return 'sar-aircraft';
  if (m.startsWith('99')) return 'aton';
  if (m.startsWith('98')) return 'class-b'; // craft that belong to a parent ship (tenders, lifeboats)
  if (m.startsWith('00')) return 'base-station';
  return null;
}

function atonKey(aidType: number | null | undefined, virtual: boolean | null | undefined): MarineIconKey {
  if (virtual) return 'aton-virtual';
  // 1-19 are fixed (reference points, RACONs, structures, lights, beacons); 20-31 float.
  // 4 is an emergency wreck marking buoy, so it floats.
  if (aidType != null && aidType >= 1 && aidType <= 19 && aidType !== 4) return 'aton-fixed';
  return 'aton';
}

/** The icon key for an AIS target. Never throws; unknown targets get 'unknown'. */
export function marineIconKey(target: MarineTarget): MarineIconKey {
  const byMmsi = marineIconKeyForMmsi(target.mmsi);
  const raw = target.type == null ? '' : String(target.type).trim();
  const lower = raw.toLowerCase();

  // Aids to navigation: by message 21 fields, our "aton:" type, or MMSI.
  // Explicit aid fields win over the stored form, which wins over type text.
  if (
    target.messageType === 21 ||
    target.aidType != null ||
    target.virtual === true ||
    lower.startsWith('aton') ||
    byMmsi === 'aton'
  ) {
    let aid = target.aidType ?? null;
    let virtual = target.virtual ?? null;
    if (lower.startsWith('aton')) {
      const parts = lower.split(':');
      const n = Number(parts[1]);
      if (aid == null && Number.isFinite(n) && parts[1] !== '') aid = n;
      if (virtual == null) virtual = parts.includes('virtual');
    } else if (virtual == null && lower.includes('virtual')) {
      virtual = true;
    }
    // Without an aid type, type text such as "lighthouse" still says it is fixed.
    if (aid == null && !virtual && raw !== '' && !lower.startsWith('aton')) {
      for (const [name, key] of NAME_INDEX) if (key === 'aton-fixed' && lower.includes(name)) return 'aton-fixed';
    }
    return atonKey(aid, virtual);
  }
  if (target.messageType === 4 || target.messageType === 11) return 'base-station';
  if (target.messageType === 9) return 'sar-aircraft';
  if (byMmsi && byMmsi !== 'class-b') return byMmsi;

  if (raw !== '') {
    const code = /^\d+$/.test(raw) ? Number(raw) : NaN;
    if (Number.isFinite(code) && code > 0) {
      for (const icon of MARINE_ICON_LIST) if (icon.codes.length && inRange(code, icon.codes)) return icon.key;
    } else if (!Number.isFinite(code)) {
      // Longest name first, so "lightship" wins over "light" and "sart" over "sar".
      for (const [name, key] of NAME_INDEX) {
        if (!lower.includes(name)) continue;
        if ((key === 'aton' || key === 'aton-fixed') && lower.includes('virtual')) return 'aton-virtual';
        if (key === 'unknown') break; // "Not available": the class B fallback may still apply
        return key;
      }
    }
  }
  const cls = target.transponderClass?.toUpperCase();
  if (byMmsi === 'class-b' || cls === 'B' || target.messageType === 18 || target.messageType === 19 || target.messageType === 24)
    return 'class-b';
  return 'unknown';
}

/** True when the map should turn the icon by the target's course or heading. */
export function marineIconRotates(key: MarineIconKey): boolean {
  return MARINE_ICONS[key].rotate;
}

const NAME_INDEX: [string, MarineIconKey][] = MARINE_ICON_LIST.flatMap((icon) =>
  icon.names.map((name) => [name, icon.key] as [string, MarineIconKey]),
).sort((a, b) => b[0].length - a[0].length);

/** A data URL for an icon, for <img> or a map's image loader. */
export function marineIconDataUrl(key: MarineIconKey): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(MARINE_ICONS[key].svg);
}

/**
 * Loads every icon as an image of `size` CSS pixels at `pixelRatio`, for
 * map.addImage() in MapLibre or Mapbox GL. Resolves to [key, image] pairs.
 */
export async function loadMarineIconImages(
  size = 32,
  pixelRatio = 2,
): Promise<[MarineIconKey, ImageData][]> {
  const px = Math.round(size * pixelRatio);
  return Promise.all(
    MARINE_ICON_LIST.map(
      (icon) =>
        new Promise<[MarineIconKey, ImageData]>((resolve, reject) => {
          const img = new Image(px, px);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = px;
            canvas.height = px;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('no 2d context'));
            ctx.drawImage(img, 0, 0, px, px);
            resolve([icon.key, ctx.getImageData(0, 0, px, px)]);
          };
          img.onerror = () => reject(new Error(`marine icon ${icon.key} failed to load`));
          img.src = marineIconDataUrl(icon.key);
        }),
    ),
  );
}

/**
 * Relative icon size (1 = a typical 100 m ship), for `icon-size` or a pixel
 * size. Ships with a reported length (AIS dimensions to bow + to stern, in
 * meters) are sized by it; others use their type's size.
 */
export function marineIconScale(key: MarineIconKey, lengthMeters?: number | null): number {
  const icon = MARINE_ICONS[key];
  if (icon?.rotate && key !== 'sar-aircraft' && lengthMeters != null && lengthMeters > 2 && lengthMeters < 600) {
    return Math.min(1.4, Math.max(0.55, 0.25 + 0.4 * Math.log10(lengthMeters)));
  }
  return icon?.scale ?? 1;
}
