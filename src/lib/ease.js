// cubic-bezier(0.22, 1, 0.36, 1) solved in JS, so a JS-driven value can ride the exact
// same curve as the block's CSS motion.
export function easeSc8(x) {
  const x1 = 0.22;
  const y1 = 1;
  const x2 = 0.36;
  const y2 = 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const d = ((ax * t + bx) * t + cx) * t - x;
    if (Math.abs(d) < 1e-5) break;
    const s = (3 * ax * t + 2 * bx) * t + cx;
    if (Math.abs(s) < 1e-6) break;
    t -= d / s;
  }
  const clamped = Math.min(1, Math.max(0, t));
  return ((ay * clamped + by) * clamped + cy) * clamped;
}