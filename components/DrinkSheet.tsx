"use client";

import React, { useEffect, useRef, useState } from "react";
import type { DrinkId, OrderItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import DrinkArt from "./DrinkArt";

interface Props {
  drink: DrinkId;
  onClose: () => void;
  onAdd: (item: OrderItem) => void;
}

const FlameIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M8 3c-2 3 2 4 0 7M13 3c-2 3 2 4 0 7M18 3c-2 3 2 4 0 7" />
    <path d="M4 14h16v1a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
  </svg>
);

const SnowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M12 2v20M3.5 7l17 10M3.5 17l17-10" />
  </svg>
);

export default function DrinkSheet({ drink, onClose, onAdd }: Props) {
  const { t, drinkName } = useI18n();
  const [temp, setTemp] = useState<"hot" | "cold">("hot");
  const [lessSweet, setLessSweet] = useState(false);
  const [lessIce, setLessIce] = useState(false);
  const [qty, setQty] = useState(1);
  const [remarks, setRemarks] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const cold = temp === "cold";

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet glass"
        role="dialog"
        aria-modal="true"
        aria-label={drinkName(drink)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden />
        <div className="sheet-top">
          <span />
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <div className="sheet-hero">
          <DrinkArt className="sheet-art" drink={drink} cold={cold} lessIce={lessIce} size={170} />
          <h2 className="sheet-title">{drinkName(drink)}</h2>
        </div>

        <div className="seg temp" role="group">
          <button className={temp === "hot" ? "on" : ""} onClick={() => setTemp("hot")} aria-pressed={temp === "hot"}>
            <FlameIcon /> {t("hot")}
          </button>
          <button className={temp === "cold" ? "on cold" : ""} onClick={() => setTemp("cold")} aria-pressed={temp === "cold"}>
            <SnowIcon /> {t("cold")}
          </button>
        </div>

        <div className="opt-row">
          <button className={`chip ${lessSweet ? "on" : ""}`} aria-pressed={lessSweet} onClick={() => setLessSweet(!lessSweet)}>
            {t("lessSweet")}
          </button>
        </div>
        <div className={`opt-collapse ${cold ? "" : "closed"}`} aria-hidden={!cold}>
          <div>
            <div className="opt-row">
              <button
                className={`chip ${lessIce ? "on-cold" : ""}`}
                aria-pressed={lessIce}
                tabIndex={cold ? 0 : -1}
                onClick={() => setLessIce(!lessIce)}
              >
                {t("lessIce")}
              </button>
            </div>
          </div>
        </div>

        <label className="label" htmlFor="remarks">
          {t("remarks")}
        </label>
        <textarea
          id="remarks"
          className="field"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={t("remarksPlaceholder")}
          rows={2}
        />

        <div className="sheet-row">
          <span className="label" style={{ margin: 0 }}>
            {t("qty")}
          </span>
          <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="-1">
              −
            </button>
            <strong aria-live="polite">{qty}</strong>
            <button onClick={() => setQty(Math.min(20, qty + 1))} aria-label="+1">
              +
            </button>
          </div>
        </div>

        <button
          className="pill btn-foam btn-wide"
          style={{ minHeight: 54, fontSize: "1.05rem" }}
          onClick={() =>
            onAdd({ drink, temp, lessSweet, lessIce: cold ? lessIce : false, qty, remarks: remarks.trim() })
          }
        >
          {t("add")}
        </button>
      </div>
    </div>
  );
}
