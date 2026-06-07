"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if it's a touch device (disable custom cursor on mobile/tablet)
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();

    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (hidden) setHidden(false);
    };

    const handleMouseEnter = () => setHidden(false);
    const handleMouseLeave = () => setHidden(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if target or any parent is clickable/interactive
      const isClickable =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("option") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[role='button']") ||
        target.closest(".cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer";

      setHovered(!!isClickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);

    // Inject CSS globally to hide default browser cursor on desktop
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.innerHTML = `
      @media (hover: hover) and (pointer: fine) {
        body, a, button, select, option, input, textarea, [role="button"], .cursor-pointer {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);

      const injectedStyle = document.getElementById("custom-cursor-style");
      if (injectedStyle) {
        injectedStyle.remove();
      }
    };
  }, [isTouchDevice, hidden]);

  if (isTouchDevice || hidden) return null;

  return (
    <div
      className="pointer-events-none fixed z-[100000] flex items-center justify-center select-none"
      style={{
        // Adjust position so the finger tip of the hand emoji or the arrow tip points exactly at the cursor coordinates.
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: hovered ? "translate(-25%, -15%)" : "translate(-2px, -2px)",
      }}
    >
      {hovered ? (
        <span
          className="text-[24px] leading-none filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)]"
          style={{ transform: "rotate(-4deg)" }}
        >
          👆
        </span>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
        >
          <path
            d="M4.5 3V17.5L8.8 13.2L13.8 21L16.8 19L11.8 11.2H18L4.5 3Z"
            fill="#256199"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

