"use client";

/*
  One fixed WebGL canvas that redraws the site's photographs as shader planes.

  Contract for any component:
    <div data-gl data-gl-depth="1.2" className="relative ...">
      <Image fill ... />            // the normal image: layout, SEO, alt text, fallback
    </div>
  The plane always matches the element's on-screen box (so CSS, GSAP transforms and
  the horizontal gallery all just work). When its texture is ready the element gets
  `data-gl-ready` and CSS hides the <img>; without WebGL or with reduced motion the
  canvas is never created and the plain images stay.

  Effects, all transient so the photo is untouched at rest:
    - reveal: the print "develops" in with a noisy wipe the first time it enters view
    - scroll velocity: planes bend and split colour slightly while scrolling fast
    - data-gl-depth: mouse parallax offset (hero layering)
*/

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = /* glsl */ `
  uniform float uVel;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float PI = 3.14159265;
    // z is in pixels (scale.z stays 1): edges lag behind while scrolling
    p.z += sin(uv.x * PI) * uVel * 90.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uImgRes;
  uniform vec2 uPlaneRes;
  uniform vec2 uFocus;
  uniform float uVel;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  // object-fit: cover with object-position, matching the <img> it replaces
  vec2 cover(vec2 uv) {
    float rp = uPlaneRes.x / uPlaneRes.y;
    float ri = uImgRes.x / uImgRes.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    vec2 off = (1.0 - s) * vec2(uFocus.x, 1.0 - uFocus.y);
    return uv * s + off;
  }

  void main() {
    vec2 uv = vUv;

    // develop-in: image settles from a slight zoom while the wipe passes
    float r = smoothstep(0.0, 1.0, uReveal);
    uv = (uv - 0.5) * (1.0 - 0.12 * (1.0 - r)) + 0.5;

    vec2 cuv = cover(uv);
    float shift = clamp(abs(uVel), 0.0, 1.0) * 0.006;
    vec3 col;
    col.r = texture2D(uTex, cover(uv + vec2(shift, 0.0))).r;
    col.g = texture2D(uTex, cuv).g;
    col.b = texture2D(uTex, cover(uv - vec2(shift, 0.0))).b;

    // noisy wipe from the bottom, like a print coming up in the developer tray
    float n = noise(vUv * vec2(5.0, 7.0) + uTime * 0.15);
    float v = vUv.y * 0.8 + n * 0.2;
    float front = r * 1.2;
    float alpha = 1.0 - smoothstep(front - 0.1, front, v);

    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

interface Plane {
  el: HTMLElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  revealTarget: number;
  ready: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function parseFocus(img: HTMLImageElement | null): [number, number] {
  const pos = img?.style.objectPosition || "50% 50%";
  const [x = "50%", y = "50%"] = pos.split(/\s+/);
  return [parseFloat(x) / 100 || 0.5, parseFloat(y) / 100 || 0.5];
}

export default function WebGLStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return; // no WebGL: the plain images stay visible
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const DIST = 800;
    const camera = new THREE.PerspectiveCamera(45, 1, 10, 4000);
    camera.position.z = DIST;
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const loader = new THREE.TextureLoader();
    const planes = new Map<HTMLElement, Plane>();
    let order = 0;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h, false);
      // 1 world unit = 1 CSS pixel at z = 0
      camera.fov = (2 * Math.atan(h / 2 / DIST) * 180) / Math.PI;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = e.clientX / w - 0.5;
      pointer.ny = e.clientY / h - 0.5;
    };

    const addPlane = (el: HTMLElement) => {
      if (planes.has(el)) return;
      const img = el.querySelector("img");
      const material = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uImgRes: { value: new THREE.Vector2(1, 1) },
          uPlaneRes: { value: new THREE.Vector2(1, 1) },
          uFocus: { value: new THREE.Vector2(...parseFocus(img)) },
          uVel: { value: 0 },
          uReveal: { value: 0 },
          uOpacity: { value: 1 },
          uTime: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = order++; // page order: later elements draw on top, as in the DOM
      mesh.visible = false;
      scene.add(mesh);
      const plane: Plane = { el, mesh, revealTarget: 0, ready: false };
      planes.set(el, plane);

      const load = () => {
        const src = img?.currentSrc || img?.src;
        if (!src) return;
        loader.load(src, (tex) => {
          if (!planes.has(el)) return tex.dispose();
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          material.uniforms.uTex.value = tex;
          material.uniforms.uImgRes.value.set(tex.image.width, tex.image.height);
          plane.ready = true;
          el.setAttribute("data-gl-ready", "");
        });
      };
      if (img && !img.complete) img.addEventListener("load", load, { once: true });
      else load();
    };

    const removePlane = (el: HTMLElement) => {
      const p = planes.get(el);
      if (!p) return;
      scene.remove(p.mesh);
      p.mesh.material.uniforms.uTex.value?.dispose();
      p.mesh.material.dispose();
      el.removeAttribute("data-gl-ready");
      planes.delete(el);
    };

    const sync = () => {
      const found = new Set(document.querySelectorAll<HTMLElement>("[data-gl]"));
      found.forEach(addPlane);
      planes.forEach((_, el) => !found.has(el) && removePlane(el));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    let lastScroll = window.scrollY;
    let vel = 0;
    let raf = 0;
    const start = performance.now();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - start) / 1000;
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      vel = lerp(vel, Math.max(-1, Math.min(1, dy / 60)), 0.12);
      pointer.sx = lerp(pointer.sx, pointer.nx, 0.06);
      pointer.sy = lerp(pointer.sy, pointer.ny, 0.06);

      planes.forEach((p) => {
        const r = p.el.getBoundingClientRect();
        const onScreen = r.width > 0 && r.bottom > -100 && r.top < h + 100 && r.right > -100 && r.left < w + 100;
        // Follow inline opacity (GSAP crossfades write it there), so faded prints vanish too
        const opacity = p.el.style.opacity === "" ? 1 : parseFloat(p.el.style.opacity);
        const u = p.mesh.material.uniforms;
        // Develop even while faded out, so a crossfaded print arrives fully developed
        if (p.ready && onScreen) {
          if (r.top < h * 0.92) p.revealTarget = 1;
          if (p.revealTarget) u.uReveal.value = Math.min(1, u.uReveal.value + 0.012); // ~1.4s
        }
        p.mesh.visible = p.ready && onScreen && opacity > 0.005;
        if (!p.mesh.visible) return;

        const depth = parseFloat(p.el.dataset.glDepth || "0");
        p.mesh.scale.set(r.width, r.height, 1);
        p.mesh.position.set(
          r.left + r.width / 2 - w / 2 + pointer.sx * depth * -60,
          -(r.top + r.height / 2 - h / 2) + pointer.sy * depth * 60,
          depth * 20,
        );


        u.uVel.value = vel;
        u.uOpacity.value = opacity;
        u.uTime.value = t;
        u.uPlaneRes.value.set(r.width, r.height);
      });

      renderer.render(scene, camera);
    };
    tick();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.dataset.active = "true";

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      [...planes.keys()].forEach(removePlane);
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] h-full w-full"
    />
  );
}
