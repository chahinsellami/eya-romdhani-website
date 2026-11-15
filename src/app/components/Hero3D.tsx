"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero layers, two modes.
 *
 * `"scene"` — the original starfield over an opaque page-coloured ground. Used
 * when there is no photograph behind the hero.
 *
 * `"overlay"` — transparent canvas, no background colour, drawn *over* the
 * hero photograph. The opaque background had to go: a canvas painting the page
 * ground over the photo hid it completely, so the full-bleed hero would have
 * looked like an empty panel. Particles are drawn additively so they read as
 * light passing in front of the image rather than as painted dots.
 *
 * The two grounds mirror globals.css: charcoal when the page carries
 * `data-theme="dark"`, gallery white otherwise.
 */
const DARK_BG = "#1A1A1A";
const LIGHT_BG = "#FAF8F4";

function Scene({ isDark, mode }: { isDark: boolean; mode: "scene" | "overlay" }) {
  const overlay = mode === "overlay";

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />
      {/* No background colour in overlay mode — the photograph is the ground. */}
      {!overlay && <color attach="background" args={[isDark ? DARK_BG : LIGHT_BG]} />}
      {/* Local lights only — no remote HDRI fetch, so the hero renders offline. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} color="#fff3d6" />
      <spotLight
        position={[0, 12, 4]}
        angle={0.6}
        penumbra={1}
        intensity={120}
        decay={2}
        color="#ffd9a0"
      />
      {/*
        White stars are invisible on the light background and add nothing there,
        so the field only renders in the dark scheme. Over a photograph they are
        always visible, but sparse: a dense field over a face reads as noise.
      */}
      {overlay ? (
        <Drift count={isDark ? 420 : 260} />
      ) : (
        isDark && (
          <Stars radius={100} depth={50} count={1500} factor={3} saturation={0} fade speed={1} />
        )
      )}
    </>
  );
}

/**
 * Sparse slow-drift motes for the photographic hero.
 *
 * `Stars` is built for a deep-space backdrop: it fans points out to radius 100
 * and fades them, which over a portrait looks like dust on the lens. This is a
 * tight, shallow field with additive blending, so each point brightens the photo
 * beneath it instead of sitting on top of it.
 */
function Drift({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speeds[i] = 0.05 + Math.random() * 0.16;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const attr = points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = attr.array as Float32Array;
    // Clamp delta so returning to a backgrounded tab does not teleport the field.
    const step = Math.min(delta, 0.05);

    for (let i = 0; i < count; i += 1) {
      array[i * 3 + 1] += speeds[i] * step;
      if (array[i * 3 + 1] > 5) array[i * 3 + 1] = -5;
    }
    attr.needsUpdate = true;
    // Barely-there parallax: enough that the layer feels behind the type.
    points.position.x = state.pointer.x * 0.25;
    points.position.y = state.pointer.y * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#FAF8F4"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Clamp DPR at 1.75 for performance sweet spot on high-DPI displays
const TARGET_DPR = 1.75;

interface Hero3DProps {
  /**
   * `"overlay"` draws transparent particles over a photograph; `"scene"` draws
   * an opaque starfield backdrop. Defaults to `"scene"`.
   */
  mode?: "scene" | "overlay";
}

export default function Hero3D({ mode = "scene" }: Hero3DProps) {
  // Resolved after mount so server and client markup match (no hydration
  // mismatch), and kept live so a preference change is respected.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // The site ground is the off-white and does not follow the OS preference, so
  // canvas ground is resolved from the same opt-in signal globals.css uses
  // (`data-theme="dark"` on <html>) rather than from `prefers-color-scheme`.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const themeRoot = document.documentElement;

    const syncMotion = () => setPrefersReducedMotion(motionQuery.matches);
    const syncScheme = () =>
      setIsDark(themeRoot.getAttribute("data-theme") === "dark");

    syncMotion();
    syncScheme();

    motionQuery.addEventListener("change", syncMotion);

    // `data-theme` is set by whatever provides the scheme toggle, so watch the
    // attribute rather than a media query.
    const themeObserver = new MutationObserver(syncScheme);
    themeObserver.observe(themeRoot, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, TARGET_DPR]}
        frameloop={prefersReducedMotion ? "demand" : "always"}
        gl={{
          antialias: !prefersReducedMotion,
          // Overlay mode must composite against the photograph underneath.
          alpha: mode === "overlay",
          powerPreference: "high-performance",
        }}
        resize={{ debounce: 100 }}
      >
        <Scene isDark={isDark} mode={mode} />
      </Canvas>
    </div>
  );
}