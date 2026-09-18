/** Pure, deterministic geometry shared by pointer tilt and the raster gem atlas. */
type Vec3 = { x: number; y: number; z: number };
export type GemFace = { points: { x: number; y: number }[]; depth: number; light: number };
export function tiltAt(x: number, y: number, width: number, height: number, maximum = 6) {
  if (![x, y, width, height, maximum].every(Number.isFinite) || width <= 0 || height <= 0) return { x: 0, y: 0 };
  const max = Math.min(7, Math.max(0, maximum));
  const clamp = (n: number) => Math.min(1, Math.max(-1, n));
  return { x: -clamp(y / height * 2 - 1) * max || 0, y: clamp(x / width * 2 - 1) * max || 0 };
}
const ring = (radius: number, y: number): Vec3[] => Array.from({ length: 8 }, (_, i) => ({ x: Math.cos(i * Math.PI / 4) * radius, y, z: Math.sin(i * Math.PI / 4) * radius }));
const vertices: Vec3[] = [...ring(.48, -.5), ...ring(.94, -.12), ...ring(.91, .02), { x: 0, y: .95, z: 0 }];
const faces: number[][] = [Array.from({ length: 8 }, (_, i) => 7-i)];
for (let i = 0; i < 8; i++) {
  const next = (i+1) % 8;
  faces.push([i, next, next+8], [i, next+8, i+8], [i+8, next+8, next+16, i+16], [i+16, next+16, 24]);
}
export function projectGem(pitch: number, yaw: number): GemFace[] {
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
  const rotated = vertices.map(v => {
    const x = v.x*cy + v.z*sy, z = -v.x*sy + v.z*cy;
    return { x, y: v.y*cp-z*sp, z: v.y*sp+z*cp };
  });
  return faces.map(indices => {
    const points = indices.map(i => rotated[i]);
    const [a,b,c] = points;
    const u = { x: b.x-a.x, y: b.y-a.y, z: b.z-a.z }, v = { x: c.x-a.x, y: c.y-a.y, z: c.z-a.z };
    const n = { x: u.y*v.z-u.z*v.y, y: u.z*v.x-u.x*v.z, z: u.x*v.y-u.y*v.x };
    const length = Math.hypot(n.x,n.y,n.z) || 1;
    return { points: points.map(p => ({ x: p.x*3.5/(3.5-p.z), y: p.y*3.5/(3.5-p.z) })), depth: points.reduce((sum,p) => sum+p.z,0)/points.length, light: Math.min(1, .22 + .78*Math.abs((-.45*n.x-.65*n.y+.61*n.z)/length)) };
  }).sort((a,b) => a.depth-b.depth);
}
