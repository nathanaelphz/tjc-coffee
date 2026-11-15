"use client";

/**
 * Top-down floor map: numbered circles on a dark floor.
 * - pick mode: tap a table to select it
 * - edit mode: tap empty floor to add, drag to move, double-tap to remove
 */

import React, { useRef, useState } from "react";
import type { TableSpot } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const HALF = 27; // half of the 54px spot

interface Props {
  tables: TableSpot[];
  mode: "pick" | "edit";
  selectedId?: string | null;
  onPick?: (t: TableSpot) => void;
  onChange?: (tables: TableSpot[]) => void;
}

export default function TableMap({ tables, mode, selectedId, onPick, onChange }: Props) {
  const { t, tableName } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const movedRef = useRef(false);

  const toRel = (clientX: number, clientY: number) => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.min(0.96, Math.max(0.04, (clientX - r.left) / r.width)),
      y: Math.min(0.94, Math.max(0.1, (clientY - r.top) / r.height)),
    };
  };

  const addAt = (clientX: number, clientY: number) => {
    const { x, y } = toRel(clientX, clientY);
    const n = tables.length ? Math.max(...tables.map((s) => s.n)) + 1 : 1;
    onChange?.([...tables, { id: `t${Date.now()}`, n, x, y }]);
  };

  return (
    <div
      ref={ref}
      className="tm"
      onPointerMove={(e) => {
        if (mode !== "edit" || !dragId) return;
        movedRef.current = true;
        const { x, y } = toRel(e.clientX, e.clientY);
        onChange?.(tables.map((s) => (s.id === dragId ? { ...s, x, y } : s)));
      }}
      onPointerUp={() => setDragId(null)}
      onClick={(e) => {
        if (mode === "edit" && e.target === ref.current && !movedRef.current) addAt(e.clientX, e.clientY);
        movedRef.current = false;
      }}
    >
      <div className="tm-grid" aria-hidden />
      <div className="tm-front" aria-hidden>
        {t("front")}
      </div>

      {tables.map((s, i) => {
        const selected = s.id === selectedId;
        return (
          <button
            key={s.id}
            className={`tm-spot${selected ? " selected" : ""}`}
            aria-label={tableName(s.n)}
            aria-pressed={mode === "pick" ? selected : undefined}
            onPointerDown={(e) => {
              if (mode === "edit") {
                e.stopPropagation();
                setDragId(s.id);
                movedRef.current = false;
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
              }
            }}
            onDoubleClick={(e) => {
              if (mode === "edit") {
                e.stopPropagation();
                onChange?.(tables.filter((x) => x.id !== s.id));
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (mode === "pick") onPick?.(s);
            }}
            style={{
              left: `calc(${s.x * 100}% - ${HALF}px)`,
              top: `calc(${s.y * 100}% - ${HALF}px)`,
              animationDelay: `${Math.min(i, 14) * 70 + 1300}ms`,
              cursor: mode === "edit" ? "grab" : "pointer",
              transition: dragId === s.id ? "none" : undefined,
            }}
          >
            {s.n}
          </button>
        );
      })}
    </div>
  );
}
