import React, { useId } from "react";
import type { DrinkId } from "@/lib/types";

/**
 * Top-down illustrations of each drink. Hot drinks sit on a saucer with a handle;
 * cold drinks are a glass with ice and a straw.
 */

interface Props {
  drink: DrinkId;
  cold?: boolean;
  lessIce?: boolean;
  size?: number;
  className?: string;
}

export default function DrinkArt({ drink, cold = false, lessIce = false, size = 96, className }: Props) {
  const uid = useId().replace(/:/g, "");
  const id = (s: string) => `${uid}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  const liquid = (
    <>
      {drink === "espresso" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("espresso")} />
          <circle cx="60" cy="60" r="25" fill="none" stroke="#e0a566" strokeOpacity="0.35" strokeWidth="5" />
          <path d="M40 50 A24 24 0 0 1 56 37" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {drink === "latte" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("milk")} />
          <circle cx="60" cy="60" r="30" fill="none" stroke="#b9783f" strokeOpacity="0.45" strokeWidth="3" />
          <path d="M60 80 C33 63 41 40 60 52 C79 40 87 63 60 80Z" fill="#fffaf1" transform="translate(0 -4)" />
        </>
      )}
      {drink === "americano" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("americano")} />
          <circle cx="60" cy="60" r="28" fill="none" stroke="#c58847" strokeOpacity="0.4" strokeWidth="3" />
          <path d="M38 52 A25 25 0 0 1 54 36" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {drink === "longblack" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("longblack")} />
          <circle cx="60" cy="60" r="27" fill="none" stroke="#d49a58" strokeOpacity="0.5" strokeWidth="5" />
          <circle cx="50" cy="52" r="1.6" fill="#f0c58e" fillOpacity="0.7" />
          <circle cx="70" cy="64" r="1.3" fill="#f0c58e" fillOpacity="0.7" />
          <circle cx="62" cy="46" r="1.1" fill="#f0c58e" fillOpacity="0.6" />
        </>
      )}
      {drink === "cappuccino" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("foam")} />
          <g fill="none" stroke="#8a5530" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round">
            <path d="M60 36 C49 42 49 51 60 53 C71 51 71 42 60 36Z" />
            <path d="M60 46 C47 53 47 63 60 65 C73 63 73 53 60 46Z" />
            <path d="M60 57 C45 64 46 75 60 77 C74 75 75 64 60 57Z" />
            <path d="M60 34 V82" />
          </g>
        </>
      )}
      {drink === "mocha" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("mocha")} />
          <g fill="none" stroke="#3a1d10" strokeOpacity="0.8" strokeWidth="2">
            <circle cx="60" cy="60" r="8" />
            <circle cx="60" cy="60" r="16" />
            <circle cx="60" cy="60" r="24" />
          </g>
          <path d="M60 28V92M28 60H92M37 37L83 83M83 37L37 83" stroke="#3a1d10" strokeOpacity="0.7" strokeWidth="1.4" />
        </>
      )}
      {drink === "chocolate" && (
        <>
          <circle cx="60" cy="60" r="32" fill={url("choc")} />
          <g fill="#fff5e8">
            <rect x="44" y="46" width="15" height="15" rx="5" transform="rotate(-14 51 53)" />
            <rect x="62" y="58" width="15" height="15" rx="5" transform="rotate(12 69 65)" />
            <rect x="52" y="66" width="12" height="12" rx="4" transform="rotate(-8 58 72)" />
          </g>
          <g fill="#3a1d10" fillOpacity="0.5">
            <circle cx="74" cy="45" r="1.3" />
            <circle cx="46" cy="70" r="1.2" />
            <circle cx="80" cy="56" r="1" />
          </g>
        </>
      )}
    </>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <radialGradient id={id("saucer")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#f6ecdd" />
          <stop offset="0.6" stopColor="#cdbba3" />
          <stop offset="1" stopColor="#8d7a66" />
        </radialGradient>
        <radialGradient id={id("cup")} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fffaf2" />
          <stop offset="1" stopColor="#dccbb3" />
        </radialGradient>
        <radialGradient id={id("espresso")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#7a4423" />
          <stop offset="0.6" stopColor="#4a2512" />
          <stop offset="1" stopColor="#2a140a" />
        </radialGradient>
        <radialGradient id={id("milk")} cx="0.45" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#fff4e4" />
          <stop offset="0.7" stopColor="#ecd0a8" />
          <stop offset="1" stopColor="#c9965f" />
        </radialGradient>
        <radialGradient id={id("americano")} cx="0.4" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#4b2713" />
          <stop offset="1" stopColor="#1e0f08" />
        </radialGradient>
        <radialGradient id={id("longblack")} cx="0.4" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#331a0d" />
          <stop offset="1" stopColor="#120804" />
        </radialGradient>
        <radialGradient id={id("foam")} cx="0.45" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.65" stopColor="#efd9b6" />
          <stop offset="1" stopColor="#c89a64" />
        </radialGradient>
        <radialGradient id={id("mocha")} cx="0.45" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#f0d6b2" />
          <stop offset="0.7" stopColor="#c99a68" />
          <stop offset="1" stopColor="#7a4a2a" />
        </radialGradient>
        <radialGradient id={id("choc")} cx="0.4" cy="0.35" r="0.85">
          <stop offset="0" stopColor="#7a452a" />
          <stop offset="1" stopColor="#35190e" />
        </radialGradient>
        <filter id={id("blur")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <clipPath id={id("clip")}>
          <circle cx="60" cy="60" r="32" />
        </clipPath>
      </defs>

      <circle cx="65" cy="69" r={cold ? 44 : 52} fill="#000" opacity="0.5" filter={url("blur")} />

      {!cold && (
        <g transform={drink === "espresso" ? "translate(60 60) scale(0.82) translate(-60 -60)" : undefined}>
          <circle cx="60" cy="60" r="54" fill={url("saucer")} />
          <circle cx="60" cy="60" r="45" fill="none" stroke="#000" strokeOpacity="0.1" />
          <rect x="94" y="52" width="21" height="16" rx="8" fill={url("cup")} stroke="#000" strokeOpacity="0.12" />
          <circle cx="60" cy="60" r="41" fill={url("cup")} stroke="#000" strokeOpacity="0.14" />
          <circle cx="60" cy="60" r="35" fill="#1a0f08" fillOpacity="0.35" />
          <g clipPath={url("clip")}>{liquid}</g>
        </g>
      )}

      {cold && (
        <g>
          <circle cx="60" cy="60" r="44" fill="#cfe4ff" fillOpacity="0.1" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
          <g transform="translate(60 60) scale(1.2) translate(-60 -60)">
            <g clipPath={url("clip")}>{liquid}</g>
          </g>
          <circle cx="60" cy="60" r="38" fill="#9cc9ff" fillOpacity="0.14" />
          <g fill="#fff" fillOpacity="0.3" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.2">
            <rect x="38" y="42" width="19" height="19" rx="5" transform="rotate(18 47 51)" />
            {!lessIce && (
              <>
                <rect x="64" y="50" width="18" height="18" rx="5" transform="rotate(-14 73 59)" />
                <rect x="48" y="68" width="17" height="17" rx="5" transform="rotate(32 56 76)" />
              </>
            )}
          </g>
          <path d="M72 54 L100 12" stroke="#f6efe6" strokeWidth="5" strokeLinecap="round" />
          <path d="M72 54 L100 12" stroke="#f2b783" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="5 6" />
          <path d="M26 44 A38 38 0 0 1 48 24" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
