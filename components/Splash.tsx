"use client";

import { useEffect } from "react";

/**
 * Short opening moment, shown once per browser session. The hide/show logic is pure CSS
 * (see .splash in globals.css) so it never blocks the page if JavaScript is slow.
 */
export default function Splash() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem("tjc-splash", "1");
      } catch {
        /* private mode: ignore */
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="splash" aria-hidden>
      <div className="splash-inner">
        <svg width="76" height="76" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="sp-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f7e6d6" />
              <stop offset="1" stopColor="#f0b27a" />
            </linearGradient>
          </defs>
          <path d="M14 26h30v10a14 14 0 0 1-14 14h-2a14 14 0 0 1-14-14z" fill="url(#sp-g)" />
          <path d="M44 29h4a5 5 0 0 1 0 10h-4" stroke="url(#sp-g)" strokeWidth="4" />
          <path className="splash-steam" d="M24 11c-3 3 3 5 0 9M32 11c-3 3 3 5 0 9" stroke="#f6efe6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="splash-word">TJC Seremban Coffee</span>
      </div>
    </div>
  );
}
