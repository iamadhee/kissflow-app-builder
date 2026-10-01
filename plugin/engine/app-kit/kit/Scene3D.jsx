// GENERATED from starter/src/components/kit/Scene3D.jsx (sha256:9d472a6e385c3536). Do not edit: change the source and run `npm run sync:kit` in packages/kernel; a hand edit here fails the kernel suite.
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Bounds } from "@react-three/drei";

import { resolveCssColor, resolveToken } from "./tones.js";

// 3D, kept on a short leash.
//
// three.js is the largest thing in the bundle and most business screens are better off without it —
// a rotating cube behind a KPI is decoration that costs ~600KB. It earns its place when the SPACE is
// the data and a flat chart genuinely cannot say it: warehouse bin occupancy across racks, tank or
// silo levels, a site or deck layout, equipment position on a floor plan.
//
// Lazily importing this file keeps three.js out of the main chunk for every page that does not use
// it — Vite splits on the dynamic import, so the cost lands only where the 3D actually is.
//
//   const Scene3D = lazy(() => import("@/components/kit/Scene3D.jsx").then(m => ({ default: m.Scene3D })));

/** A labelled column. value drives the height, so a row of these reads as a 3D bar chart. */
export function Bar3D({ position = [0, 0, 0], value = 1, max = 1, label, tone = "indigo", width = 0.7 }) {
  const h = Math.max(0.05, (Number(value) / (Number(max) || 1)) * 4);
  return (
    <group position={position}>
      {/* the box is centred on its origin, so it is lifted by half its height to stand ON the floor */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[width, h, width]} />
        <meshStandardMaterial color={resolveCssColor(tone)} roughness={0.45} metalness={0.05} />
      </mesh>
      {label != null && (
        <Html position={[0, h + 0.35, 0]} center distanceFactor={10}>
          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", color: "var(--ctl-fg)" }}>{label}</div>
        </Html>
      )}
    </group>
  );
}

/**
 * The canvas, lit and framed. Drop Bar3D or your own meshes inside.
 * `Bounds fit` frames whatever children exist, so a scene never opens off-camera or microscopic.
 */
export function Scene3D({ children, height = 380, autoRotate = false, background = "transparent" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-solid border-ctl-border bg-ctl-surface" style={{ height }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [6, 5, 8], fov: 45 }} style={{ background }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[6, 10, 6]} intensity={1.1} castShadow />
          <Bounds fit clip observe margin={1.2}>{children}</Bounds>
          <Environment preset="city" />
          {/* zoom is off by default: a canvas inside a scrolling page must not eat the page scroll */}
          <OrbitControls makeDefault enableZoom={false} enablePan={false}
                         autoRotate={autoRotate} autoRotateSpeed={0.6}
                         minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.1} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** The common case, wired: one call turns [{label,value,tone}] into a row of columns. */
export function Bars3D({ data = [], height = 380, gap = 1.1, autoRotate = true }) {
  if (!data.length) {
    return (
      <div className="grid place-items-center rounded-xl border-2 border-dashed border-ctl-border-strong text-sm text-ctl-fg-muted"
           style={{ height: Math.min(height, 200) }}>
        Nothing to plot yet.
      </div>
    );
  }
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);
  const mid = (data.length - 1) / 2;
  return (
    <Scene3D height={height} autoRotate={autoRotate}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[data.length * gap + 3, 6]} />
        <meshStandardMaterial color={resolveToken("--ctl-track")} roughness={1} />
      </mesh>
      {data.map((d, i) => (
        <Bar3D key={i} position={[(i - mid) * gap, 0, 0]} value={d.value} max={max} label={d.label} tone={d.tone || "indigo"} />
      ))}
    </Scene3D>
  );
}
