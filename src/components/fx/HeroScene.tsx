import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Hero 3D 場景（react-three-fiber，零 drei——全部手寫，慳 300KB+）。
 * - 品牌紅流體球（icosahedron 頂點正弦位移）+ 翡翠環 / 琥珀二十面體 / 藍八面體 / 紫環懸浮。
 * - Rig 鏡頭組跟滑鼠緩動（damp），整體視差縱深。
 * - 透明底，疊喺極光背景之上、內容之下。
 */

type V3 = [number, number, number];

/** 決定性偽隨機（mulberry32）：React render 期間唔准用 Math.random（lint 純函數規則） */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 手作浮沉：慢速上下浮 + 緩慢自轉 */
function FloatGroup({
  base,
  speed = 1.4,
  amp = 0.28,
  spin = 0.15,
  children,
}: {
  base: V3;
  speed?: number;
  amp?: number;
  spin?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  // 相位由座標推導（決定性），件件錯開唔會齊上齊落
  const phase = useMemo(() => (base[0] * 1.7 + base[1] * 2.3 + base[2] * 0.9) % (Math.PI * 2), [base]);
  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * speed + phase;
    g.position.set(base[0], base[1] + Math.sin(t) * amp, base[2]);
    g.rotation.y += spin * dt;
    g.rotation.x = Math.sin(t * 0.6) * 0.15;
  });
  return (
    <group ref={ref} position={base}>
      {children}
    </group>
  );
}

/** 品牌紅流體球：頂點正弦位移（per-frame morph） */
function Blob({ position }: { position: V3 }) {
  const geoRef = useRef<THREE.IcosahedronGeometry>(null);
  const basePos = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    const geo = geoRef.current;
    if (!geo) return;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (!basePos.current) basePos.current = (pos.array as Float32Array).slice();
    const arr = pos.array as Float32Array;
    const b = basePos.current;
    const t = clock.elapsedTime * 1.3;
    for (let i = 0; i < arr.length; i += 3) {
      const x = b[i];
      const y = b[i + 1];
      const z = b[i + 2];
      const n =
        Math.sin(x * 1.8 + t) * Math.cos(y * 1.6 + t * 1.2) * Math.sin(z * 1.7 + t * 0.8);
      const s = 1 + n * 0.15;
      arr[i] = x * s;
      arr[i + 1] = y * s;
      arr[i + 2] = z * s;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <FloatGroup base={position} speed={1.1} amp={0.22} spin={0.1}>
      <mesh>
        <icosahedronGeometry ref={geoRef} args={[1.55, 16]} />
        <meshPhysicalMaterial
          color="#C8102E"
          roughness={0.18}
          metalness={0.1}
          clearcoat={0.7}
          clearcoatRoughness={0.3}
        />
      </mesh>
    </FloatGroup>
  );
}

/** 星塵微粒層（THREE.Points，緩慢旋轉） */
function Dust({
  count = 90,
  color,
  opacity,
  size = 0.05,
}: {
  count?: number;
  color: string;
  opacity: number;
  size?: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(count * 97 + 13);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 12;
      arr[i * 3 + 1] = (rand() - 0.5) * 7;
      arr[i * 3 + 2] = (rand() - 0.5) * 4 - 1;
    }
    return arr;
  }, [count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** 滑鼠追蹤鏡頭組：全域 pointermove → 整組緩動旋轉 + 位移 */
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();
  // 窄屏（手機直身）：成組縮細，等裝飾收返入畫面，唔會全部出晒鏡
  const narrow = viewport.aspect < 1;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, mouse.current.x * 0.22, 2.2, dt);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, mouse.current.y * 0.15, 2.2, dt);
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, mouse.current.x * 0.35, 2.2, dt);
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      -mouse.current.y * 0.22 + (narrow ? 0.4 : 0),
      2.2,
      dt,
    );
    const s = THREE.MathUtils.damp(ref.current.scale.x, narrow ? 0.6 : 1, 4, dt);
    ref.current.scale.setScalar(s);
  });

  return <group ref={ref}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      {/* 燈光：環境光 + 主光 + 暖色補光（唔用 Environment HDR，慳流量） */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 7, 6]} intensity={1.6} />
      <directionalLight position={[-6, -3, 4]} intensity={0.55} color="#F5C518" />
      <pointLight position={[0, 4, 5]} intensity={12} color="#FBEAEC" />

      <Rig>
        {/* 主角：品牌紅流體球（右側，襯喺維港插畫後面） */}
        <Blob position={[3.1, 0.3, -0.5]} />

        {/* 翡翠圓環（左邊緣露出少少，唔會冚字） */}
        <FloatGroup base={[-7.1, 0.6, -3.5]} speed={1.8} amp={0.32} spin={0.5}>
          <mesh rotation={[0.9, 0.4, 0]}>
            <torusGeometry args={[0.9, 0.28, 32, 64]} />
            <meshStandardMaterial color="#0E7C66" roughness={0.28} metalness={0.25} />
          </mesh>
        </FloatGroup>

        {/* 琥珀二十面體（左下角出鏡位） */}
        <FloatGroup base={[-6.5, -3.4, -2.0]} speed={2.1} amp={0.3} spin={0.7}>
          <mesh>
            <icosahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial color="#D98E04" roughness={0.3} metalness={0.2} flatShading />
          </mesh>
        </FloatGroup>

        {/* 藍色八面體（右上遠景） */}
        <FloatGroup base={[4.6, 2.3, -2.6]} speed={1.6} amp={0.4} spin={0.9}>
          <mesh>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial color="#2E6FDB" roughness={0.35} metalness={0.15} flatShading />
          </mesh>
        </FloatGroup>

        {/* 紫環（右下遠景，幼身） */}
        <FloatGroup base={[2.2, -2.2, -2.2]} speed={1.5} amp={0.34} spin={0.4}>
          <mesh rotation={[1.2, 0, 0.5]}>
            <torusGeometry args={[0.6, 0.16, 24, 48]} />
            <meshStandardMaterial color="#5B4FA6" roughness={0.3} metalness={0.25} />
          </mesh>
        </FloatGroup>

        {/* 星塵 */}
        <Dust count={55} color="#C8102E" opacity={0.5} size={0.055} />
        <Dust count={40} color="#181D2E" opacity={0.3} size={0.04} />
      </Rig>
    </Canvas>
  );
}
