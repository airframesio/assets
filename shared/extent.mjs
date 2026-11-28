// The drawn extent of an icon's outline on the 32 x 32 grid, for true-size
// drawing: aircraft use their width (wingtip to wingtip), ships their height
// (bow to stern). Paths are absolute (M L H V Q C A Z); control points count,
// which can overshoot a curve by a little.
export function pathBounds(ds) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (const d of ds) {
    let x = 0, y = 0;
    for (const [, cmd, args] of d.matchAll(/([MLHVQCAZ])([^MLHVQCAZ]*)/g)) {
      const n = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
      if (cmd === 'H') for (const v of n) add((x = v), y);
      else if (cmd === 'V') for (const v of n) add(x, (y = v));
      else if (cmd === 'A')
        for (let i = 0; i + 6 < n.length + 1; i += 7) {
          const [rx, ry, , , , ex, ey] = n.slice(i, i + 7);
          const mx = (x + ex) / 2, my = (y + ey) / 2;
          add(mx - rx, my - ry); add(mx + rx, my + ry); add((x = ex), (y = ey));
        }
      else for (let i = 0; i + 1 < n.length; i += 2) add((x = n[i]), (y = n[i + 1]));
    }
  }
  return { width: +(x1 - x0).toFixed(2), height: +(y1 - y0).toFixed(2) };
}
