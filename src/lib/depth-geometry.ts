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

export type RGB = [number, number, number];

export const GEM_THEMES: Record<string, RGB> = {
  jade: [0, 166, 126],    // #00A67E
  amber: [217, 119, 6],   // #D97706
  ink: [27, 43, 37],      // #1B2B25
  ruby: [200, 16, 46],    // #C8102E
  cyan: [14, 165, 233],   // #0EA5E9
  gold: [181, 138, 72],   // #B58A48
  slate: [100, 116, 139], // #64748B
  purple: [147, 51, 234], // #9333EA
  blue: [37, 99, 235],    // #2563EB
};

/** Parse any hex string, css rgb/rgba string, or theme keyword into safe [r, g, b]. */
export function parseGemColor(input?: string): RGB {
  if (!input || typeof input !== "string") return GEM_THEMES.jade;
  const clean = input.trim().toLowerCase();
  if (GEM_THEMES[clean]) return GEM_THEMES[clean];

  if (clean.startsWith("#")) {
    const raw = clean.slice(1);
    if (raw.length === 3) {
      const r = parseInt(raw[0] + raw[0], 16);
      const g = parseInt(raw[1] + raw[1], 16);
      const b = parseInt(raw[2] + raw[2], 16);
      if ([r, g, b].every(n => Number.isFinite(n) && n >= 0 && n <= 255)) return [r, g, b];
    } else if (raw.length >= 6) {
      const r = parseInt(raw.slice(0, 2), 16);
      const g = parseInt(raw.slice(2, 4), 16);
      const b = parseInt(raw.slice(4, 6), 16);
      if ([r, g, b].every(n => Number.isFinite(n) && n >= 0 && n <= 255)) return [r, g, b];
    }
  }

  const rgbMatch = clean.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    if ([r, g, b].every(Number.isFinite)) return [r, g, b];
  }

  return GEM_THEMES.jade;
}

export interface GemShading {
  fill: string;
  stroke: string;
  specular: number;
}

/** Compute diffuse facet color and specular highlight for 3D crystal faces. */
export function computeGemShading(base: RGB, light: number): GemShading {
  const boundedLight = Math.max(0, Math.min(1, Number.isFinite(light) ? light : 0.5));
  const diffuse = 0.42 + 0.58 * boundedLight;
  const specular = boundedLight > 0.68 ? Math.pow((boundedLight - 0.68) / 0.32, 2.2) : 0;

  const r = Math.min(255, Math.max(0, Math.round(base[0] * diffuse * (1 - specular) + 255 * specular)));
  const g = Math.min(255, Math.max(0, Math.round(base[1] * diffuse * (1 - specular) + 255 * specular)));
  const b = Math.min(255, Math.max(0, Math.round(base[2] * diffuse * (1 - specular) + 255 * specular)));

  const strokeAlpha = Math.min(0.65, Math.max(0.12, 0.15 + specular * 0.45));
  return {
    fill: `rgb(${r},${g},${b})`,
    stroke: `rgba(255,255,255,${strokeAlpha.toFixed(2)})`,
    specular,
  };
}

/** Bound DPR to [1, 2] to cap render cost on high-resolution displays. */
export function boundedDpr(dpr?: number): number {
  if (!Number.isFinite(dpr) || (dpr ?? 0) <= 0) return 1;
  return Math.min(2, Math.max(1, dpr!));
}

/** Bound gem size to [12, 512] pixels. */
export function boundedGemSize(size?: number): number {
  if (!Number.isFinite(size) || (size ?? 0) <= 0) return 32;
  return Math.min(512, Math.max(12, Math.round(size!)));
}

export interface RenderGemOptions {
  width: number;
  height: number;
  pitch: number;
  yaw: number;
  color?: string | RGB;
  glow?: boolean;
  scale?: number;
}

export type Canvas2DContextLike = {
  clearRect: (x: number, y: number, w: number, h: number) => void;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  closePath: () => void;
  fill: () => void;
  stroke: () => void;
  fillStyle: unknown;
  strokeStyle: unknown;
  lineWidth: number;
  save?: () => void;
  restore?: () => void;
  arc?: (x: number, y: number, r: number, sAngle: number, eAngle: number) => void;
  createRadialGradient?: (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => { addColorStop: (offset: number, color: string) => void };
};

/** Render the 33-face 3D crystal onto any canvas 2D context. */
export function renderGem(
  ctx: CanvasRenderingContext2D | Canvas2DContextLike,
  options: RenderGemOptions,
): void {
  const { width, height, pitch, yaw, color, glow = true, scale = 0.40 } = options;
  if (!width || !height || width <= 0 || height <= 0) return;
  ctx.clearRect(0, 0, width, height);

  const rgb = Array.isArray(color) ? color : parseGemColor(color);
  const cx = width / 2;
  const cy = height / 2;
  const gemRadius = Math.min(width, height) * Math.max(0.1, Math.min(0.5, scale));

  if (glow && ctx.save && ctx.restore && ctx.createRadialGradient && ctx.arc) {
    ctx.save();
    try {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, gemRadius * 1.35);
      grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.28)`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, gemRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();
    } catch {
      // safe fallback if gradient is unsupported
    }
    ctx.restore();
  }

  const faces = projectGem(pitch, yaw);
  const lineWidth = Math.max(0.5, Math.min(1.5, width / 50));

  for (let f = 0; f < faces.length; f++) {
    const face = faces[f];
    if (!face.points || face.points.length === 0) continue;

    ctx.beginPath();
    for (let i = 0; i < face.points.length; i++) {
      const p = face.points[i];
      const px = cx + p.x * gemRadius;
      const py = cy + p.y * gemRadius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();

    const shading = computeGemShading(rgb, face.light);
    ctx.fillStyle = shading.fill;
    ctx.fill();
    ctx.strokeStyle = shading.stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

