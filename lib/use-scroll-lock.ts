"use client";

import { useEffect } from "react";

/**
 * True body scroll lock for a full-screen mobile overlay.
 *
 * `overflow: hidden` on the body alone does NOT stop iOS Safari's background
 * rubber-band/bounce scroll behind a `position: fixed` overlay — the page
 * keeps dragging under your finger (both axes), which is what made the venue
 * modal look like it was drifting around. Pinning the body itself in place
 * with `position: fixed` (and restoring the exact scroll offset on unlock)
 * is the standard fix.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
