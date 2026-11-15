"use client";

import Link from "next/link";
import React from "react";
import { useI18n } from "@/lib/i18n";

export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="mk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e6d6" />
          <stop offset="1" stopColor="#f0b27a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="rgba(255,255,255,0.07)" />
      <path d="M17 28h26v9a12 12 0 0 1-12 12h-2a12 12 0 0 1-12-12z" fill="url(#mk-g)" />
      <path d="M43 30h3a4.5 4.5 0 0 1 0 9h-3" stroke="url(#mk-g)" strokeWidth="3.4" />
      <path d="M25 13c-2.6 2.6 2.6 4.4 0 8M33 13c-2.6 2.6 2.6 4.4 0 8" stroke="#f6efe6" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function TopBar({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="topbar glass">
      <Link href="/" className="brand" aria-label={t("appName")}>
        <Mark />
        <span className="brand-name">{t("brandShort")}</span>
      </Link>
      <div className="topbar-right">{children}</div>
    </header>
  );
}
