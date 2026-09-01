"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Which of the 9 grid cells carry a pip, per face value. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Face value + the rotation that brings that face outward (before the push on Z). */
const FACES: { value: number; rx: number; ry: number }[] = [
  { value: 1, rx: 0, ry: 0 },
  { value: 6, rx: 0, ry: 180 },
  { value: 3, rx: 0, ry: 90 },
  { value: 4, rx: 0, ry: -90 },
  { value: 5, rx: 90, ry: 0 },
  { value: 2, rx: -90, ry: 0 },
];

/** Idle tumble speed, in degrees per ~60fps frame. */
const IDLE_VEL = { x: 0.12, y: 0.3 };
const DRAG_SENS = 0.4;
const FRICTION = 0.94;
const RESUME_MS = 1800;

/**
 * Feature-detect real 3D: some engines (notably older / mobile Safari in
 * certain layouts) ignore `transform-style: preserve-3d` and flatten the cube
 * to a single face. When that happens we fall back to a clean 2D "flip" die.
 */
function supports3D(): boolean {
  if (typeof document === "undefined" || !document.body) return true;
  try {
    const outer = document.createElement("div");
    outer.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:100px;height:100px;perspective:200px";
    const mid = document.createElement("div");
    mid.style.cssText = "width:100px;height:100px;transform-style:preserve-3d";
    const inner = document.createElement("div");
    inner.style.cssText = "width:100px;height:100px;transform:translateZ(60px)";
    mid.appendChild(inner);
    outer.appendChild(mid);
    document.body.appendChild(outer);
    // with working preserve-3d + perspective, translateZ(60) magnifies the child
    const w = inner.getBoundingClientRect().width;
    document.body.removeChild(outer);
    return w > 115;
  } catch {
    return true;
  }
}

const pipCells = (value: number) =>
  Array.from({ length: 9 }, (_, i) => (
    <span key={i} className="dice-pip" data-on={PIPS[value].includes(i) || undefined} />
  ));

interface Dice3DProps {
  /** Cube edge length in px. */
  size?: number;
  className?: string;
  /** Allow drag / keyboard spinning. When false the die only tumbles on its own. */
  interactive?: boolean;
  /** Warm "table light" halo behind the die. */
  glow?: boolean;
}

export function Dice3D({
  size = 128,
  className,
  interactive = true,
  glow = true,
}: Dice3DProps) {
  const half = size / 2;
  const coreZ = half - size * 0.03;
  const persp = Math.round(size * 3.4);
  /* bounded box for the frosted backdrop — soft-masked, centred with a wide
     margin. Capped to the container width (see .dice-stage) so it can never
     overflow and push the layout off-centre on small screens. */
  const stage = Math.round(size * 1.5);

  const [flat, setFlat] = useState(false);
  const [flatValue, setFlatValue] = useState(5);

  const sceneRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // one-time feature detection after mount (SSR always renders the cube)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!supports3D()) setFlat(true);
  }, []);

  /* ---- 3D cube animation ---- */
  useEffect(() => {
    if (flat) return;
    const scene = sceneRef.current;
    const cube = cubeRef.current;
    if (!scene || !cube) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = prefersReduced ? 0.28 : 1;
    const idleX = IDLE_VEL.x * speed;
    const idleY = IDLE_VEL.y * speed;

    let rotX = -24;
    let rotY = -32;
    let velX = idleX;
    let velY = idleY;
    let mode: "auto" | "drag" | "fling" = "auto";
    let lastInteract = 0;
    let raf = 0;
    let dragging = false;
    let lastPX = 0;
    let lastPY = 0;

    const render = () => {
      cube.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      try {
        const now = performance.now();
        if (mode === "auto") {
          velX += (idleX - velX) * 0.03;
          velY += (idleY - velY) * 0.03;
          rotX += velX;
          rotY += velY;
        } else if (mode === "fling") {
          rotX += velX;
          rotY += velY;
          velX *= FRICTION;
          velY *= FRICTION;
          if (Math.hypot(velX, velY) < 0.05 && now - lastInteract > RESUME_MS) {
            mode = "auto";
          }
        }
        render();
      } catch {
        /* keep the loop alive */
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      dragging = true;
      mode = "drag";
      lastPX = e.clientX;
      lastPY = e.clientY;
      velX = 0;
      velY = 0;
      lastInteract = performance.now();
      try {
        scene.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPX;
      const dy = e.clientY - lastPY;
      lastPX = e.clientX;
      lastPY = e.clientY;
      rotY += dx * DRAG_SENS;
      rotX -= dy * DRAG_SENS;
      velX = velX * 0.7 + -dy * DRAG_SENS * 0.3;
      velY = velY * 0.7 + dx * DRAG_SENS * 0.3;
      lastInteract = performance.now();
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      mode = "fling";
      lastInteract = performance.now();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!interactive) return;
      const impulse = 5;
      switch (e.key) {
        case "ArrowLeft": velY = -impulse; break;
        case "ArrowRight": velY = impulse; break;
        case "ArrowUp": velX = impulse; break;
        case "ArrowDown": velX = -impulse; break;
        default: return;
      }
      e.preventDefault();
      mode = "fling";
      lastInteract = performance.now();
    };

    scene.addEventListener("pointerdown", onPointerDown);
    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerup", onPointerUp);
    scene.addEventListener("pointercancel", onPointerUp);
    scene.addEventListener("lostpointercapture", onPointerUp);
    scene.addEventListener("keydown", onKeyDown);

    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      scene.removeEventListener("pointerdown", onPointerDown);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerup", onPointerUp);
      scene.removeEventListener("pointercancel", onPointerUp);
      scene.removeEventListener("lostpointercapture", onPointerUp);
      scene.removeEventListener("keydown", onKeyDown);
    };
  }, [flat, interactive]);

  /* ---- 2D flip-die fallback ---- */
  useEffect(() => {
    if (!flat) return;
    const scene = sceneRef.current;
    const face = flatRef.current;
    if (!scene || !face) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let t = 0;
    let vel = prefersReduced ? 0.012 : 0.045;
    let dragging = false;
    let lastPX = 0;
    let prevCos = 1;
    let value = 5;
    let raf = 0;

    const render = () => {
      const c = Math.cos(t);
      const scaleX = Math.max(0.05, Math.abs(c));
      const bright = 0.72 + 0.28 * Math.abs(c);
      face.style.transform = `scaleX(${scaleX.toFixed(3)}) rotate(${(
        Math.sin(t) * 3
      ).toFixed(2)}deg)`;
      face.style.filter = `brightness(${bright.toFixed(3)})`;
      // swap the shown face each time the die turns edge-on
      if (prevCos > 0 !== c > 0) {
        value = (value % 6) + 1;
        setFlatValue(value);
      }
      prevCos = c;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      try {
        if (!dragging) {
          const idle = prefersReduced ? 0.012 : 0.045;
          vel += (idle - vel) * 0.04;
          t += vel;
        }
        render();
      } catch {
        /* keep the loop alive */
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      dragging = true;
      lastPX = e.clientX;
      try {
        scene.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPX;
      lastPX = e.clientX;
      t += dx * 0.03;
      vel = dx * 0.03;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    scene.addEventListener("pointerdown", onPointerDown);
    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerup", onPointerUp);
    scene.addEventListener("pointercancel", onPointerUp);
    scene.addEventListener("lostpointercapture", onPointerUp);

    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      scene.removeEventListener("pointerdown", onPointerDown);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerup", onPointerUp);
      scene.removeEventListener("pointercancel", onPointerUp);
      scene.removeEventListener("lostpointercapture", onPointerUp);
    };
  }, [flat, interactive]);

  return (
    <div
      className={cn("dice-stage", !glow && "dice-stage--noglow", className)}
      style={{ width: stage, height: stage, maxWidth: "100%" }}
      aria-hidden={interactive ? undefined : true}
    >
      <div
        ref={sceneRef}
        className={cn("dice-scene", flat && "dice-scene--flat")}
        style={{ width: size, height: size, perspective: `${persp}px` }}
        role="img"
        aria-label="Dado 3D — trascinalo per farlo ruotare"
        tabIndex={interactive ? 0 : -1}
      >
        <div className="dice-shadow" />

        {flat ? (
          <div
            ref={flatRef}
            className="dice-face dice-face--flat"
            style={{ width: size, height: size }}
          >
            {pipCells(flatValue)}
          </div>
        ) : (
          <div
            ref={cubeRef}
            className="dice-cube"
            style={{
              width: size,
              height: size,
              transform: "rotateX(-24deg) rotateY(-32deg)",
            }}
          >
            {/* opaque inner cube — plugs the tiny corner nicks */}
            {FACES.map((face) => (
              <div
                key={`core-${face.value}`}
                className="dice-core"
                style={{
                  width: size,
                  height: size,
                  transform: `rotateX(${face.rx}deg) rotateY(${face.ry}deg) translateZ(${coreZ}px)`,
                }}
              />
            ))}

            {FACES.map((face) => (
              <div
                key={face.value}
                className="dice-face"
                style={{
                  width: size,
                  height: size,
                  transform: `rotateX(${face.rx}deg) rotateY(${face.ry}deg) translateZ(${half}px)`,
                }}
              >
                {pipCells(face.value)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
