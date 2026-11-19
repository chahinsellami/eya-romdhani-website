"use client";

import { useEffect, useRef } from "react";

type CursorMode = "default" | "interactive" | "view" | "next" | "hidden";
type CursorSurface = "light" | "dark";

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finePointerMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointerMq.matches || reducedMotionMq.matches) {
      return;
    }

    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !label) return;

    let active = false;
    let visible = false;
    let pressed = false;
    let mode: CursorMode = "hidden";
    let surface: CursorSurface = "light";

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const applyVisualState = () => {
      root.dataset.visible = visible ? "true" : "false";
      root.dataset.mode = mode;
      root.dataset.surface = surface;
      root.dataset.pressed = pressed ? "true" : "false";

      if (mode === "view") {
        label.textContent = "VIEW";
      } else if (mode === "next") {
        label.textContent = "NEXT";
      } else {
        label.textContent = "";
      }
    };

    const resolveTargetState = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        mode = "default";
        surface = "light";
        return;
      }

      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        mode = "hidden";
        return;
      }

      surface = target.closest('[data-cursor-surface="dark"]') ? "dark" : "light";

      const mediaTarget = target.closest<HTMLElement>("[data-cursor]");
      const cursorType = mediaTarget?.dataset.cursor;
      if (cursorType === "view" || cursorType === "next") {
        mode = cursorType;
        return;
      }

      if (
        target.closest(
          'a, button, [role="button"], summary, [tabindex]:not([tabindex="-1"])',
        )
      ) {
        mode = "interactive";
        return;
      }

      mode = "default";
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.2;
      ringY += (targetY - ringY) * 0.2;

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

      if (visible) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      if (!active) {
        active = true;
        document.documentElement.classList.add("has-custom-cursor");
        ringX = event.clientX;
        ringY = event.clientY;
      }

      targetX = event.clientX;
      targetY = event.clientY;
      visible = true;

      resolveTargetState(event.target);
      applyVisualState();
      startLoop();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pressed = true;
      applyVisualState();
    };

    const onPointerUp = () => {
      if (!pressed) return;
      pressed = false;
      applyVisualState();
    };

    const onPointerLeave = () => {
      visible = false;
      mode = "hidden";
      applyVisualState();
    };

    const onPreferenceChange = () => {
      if (!finePointerMq.matches || reducedMotionMq.matches) {
        visible = false;
        active = false;
        document.documentElement.classList.remove("has-custom-cursor");
        cancelAnimationFrame(rafId);
        rafId = 0;
        applyVisualState();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    finePointerMq.addEventListener("change", onPreferenceChange);
    reducedMotionMq.addEventListener("change", onPreferenceChange);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
      finePointerMq.removeEventListener("change", onPreferenceChange);
      reducedMotionMq.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-visible="false"
      data-mode="hidden"
      data-surface="light"
      data-pressed="false"
      className="editorial-cursor pointer-events-none fixed inset-0 z-[90] hidden md:block"
    >
      <div ref={ringRef} className="editorial-cursor-anchor">
        <div className="editorial-cursor-ring">
          <span ref={labelRef} className="editorial-cursor-label" />
        </div>
      </div>
      <div ref={dotRef} className="editorial-cursor-anchor">
        <div className="editorial-cursor-dot" />
      </div>
    </div>
  );
}
