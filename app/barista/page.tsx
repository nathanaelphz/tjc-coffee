"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DRINKS,
  EMPTY_CONFIG,
  type AppConfig,
  type DrinkId,
  type Order,
  type OrderStatus,
  type TableSpot,
} from "@/lib/types";
import { backend, downloadCsv } from "@/lib/data";
import { useI18n, LangToggle } from "@/lib/i18n";
import TopBar, { Mark } from "@/components/TopBar";
import StatusBar from "@/components/StatusBar";
import TableMap from "@/components/TableMap";
import DrinkArt from "@/components/DrinkArt";

const PIN = process.env.NEXT_PUBLIC_BARISTA_PIN || "1234";
const AUTH_KEY = "tjc-barista-ok";

export default function BaristaPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(window.sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  if (authed === null) return null;
  if (!authed)
    return (
      <Login
        onOk={() => {
          window.sessionStorage.setItem(AUTH_KEY, "1");
          setAuthed(true);
        }}
      />
    );
  return <Board onLogout={() => { window.sessionStorage.removeItem(AUTH_KEY); setAuthed(false); }} />;
}

/* ---------------- login ---------------- */

function Login({ onOk }: { onOk: () => void }) {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);

  const push = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === PIN) window.setTimeout(onOk, 150);
      else window.setTimeout(() => { setBad(true); setPin(""); }, 150);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"];

  return (
    <main className="login">
      <div className="login-card glass">
        <Mark size={44} />
        <h1>{t("loginTitle")}</h1>
        <p className="muted">{t("enterPin")}</p>
        <div className={`dots${bad ? " bad" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < pin.length ? "on" : ""} />
          ))}
        </div>
        <p className="err">{bad ? t("wrongPin") : ""}</p>
        <div className="keypad">
          {keys.map((k, i) =>
            k === "" ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                className={`key${k === "←" ? " ghost" : ""}`}
                onClick={() => { setBad(false); k === "←" ? setPin(pin.slice(0, -1)) : push(k); }}
              >
                {k}
              </button>
            )
          )}
        </div>
        <a href="/" className="link-btn" style={{ display: "inline-block", marginTop: 20 }}>
          ← {t("backToOrder")}
        </a>
      </div>
    </main>
  );
}

/* ---------------- sound ---------------- */

function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "sine";
      o.frequency.value = f;
      const s = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.18, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
      o.start(s);
      o.stop(s + 0.5);
    });
  } catch {
    /* ignore */
  }
}

/* ---------------- board ---------------- */

type Tab = "orders" | "floor" | "menu" | "history";

function Board({ onLogout }: { onLogout: () => void }) {
  const { t, drinkName } = useI18n();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<AppConfig>(EMPTY_CONFIG);
  const [sound, setSound] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const prevIds = useRef<Set<string> | null>(null);
  const fresh = useRef<Set<string>>(new Set());

  useEffect(() => {
    const u1 = backend.subscribeOrders((list) => {
      const ids = new Set(list.filter((o) => !o.archived).map((o) => o.id));
      if (prevIds.current) {
        for (const id of ids)
          if (!prevIds.current.has(id)) {
            fresh.current.add(id);
            if (sound) chime();
            window.setTimeout(() => fresh.current.delete(id), 1800);
          }
      }
      prevIds.current = ids;
      setOrders(list);
    });
    const u2 = backend.subscribeConfig(setConfig);
    return () => { u1(); u2(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2200); };
  const live = useMemo(() => orders.filter((o) => !o.archived), [orders]);

  const tabs: { id: Tab; label: string; n?: number }[] = [
    { id: "orders", label: t("tabOrders"), n: live.filter((o) => o.status !== "done").length },
    { id: "floor", label: t("tabFloor") },
    { id: "menu", label: t("tabMenu") },
    { id: "history", label: t("tabHistory") },
  ];

  return (
    <div className="page">
      <TopBar>
        <LangToggle />
        <button className="icon-btn" onClick={() => setSound((s) => !s)} aria-label={sound ? t("soundOn") : t("soundOff")} aria-pressed={sound}>
          {sound ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
            </svg>
          )}
        </button>
        <button className="pill btn-ghost" style={{ minHeight: 42, padding: "0 16px", fontSize: "0.9rem" }} onClick={onLogout}>
          {t("logout")}
        </button>
      </TopBar>

      <StatusBar />
      <h1 className="board-title">{t("baristaTitle")}</h1>

      <div className="seg tabs" role="tablist">
        {tabs.map((x) => (
          <button key={x.id} className={tab === x.id ? "on" : ""} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}>
            {x.label}
            {x.n ? <span className="tab-count">{x.n}</span> : null}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersBoard orders={live} freshSet={fresh.current} />}
      {tab === "floor" && <Floor config={config} onSaved={() => showToast(t("mapSaved"))} />}
      {tab === "menu" && <Menu config={config} />}
      {tab === "history" && <History orders={orders} onArchived={() => showToast(t("archived"))} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ---------------- orders kanban ---------------- */

function OrdersBoard({ orders, freshSet }: { orders: Order[]; freshSet: Set<string> }) {
  const { t } = useI18n();
  const [mobileCol, setMobileCol] = useState<OrderStatus>("pending");

  const byStatus = (s: OrderStatus) =>
    orders
      .filter((o) => o.status === s)
      .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.createdAt - b.createdAt);

  const pending = byStatus("pending");
  const making = byStatus("making");
  const done = byStatus("done").reverse();

  const cols: { s: OrderStatus; label: string; list: Order[]; empty: string }[] = [
    { s: "pending", label: t("pending"), list: pending, empty: t("emptyWaiting") },
    { s: "making", label: t("making"), list: making, empty: t("emptyMaking") },
    { s: "done", label: t("done"), list: done, empty: t("emptyDone") },
  ];

  const setStatus = (id: string, status: OrderStatus) => backend.updateOrder(id, { status });

  return (
    <>
      <div className="seg col-tabs">
        {cols.map((c) => (
          <button key={c.s} className={mobileCol === c.s ? "on" : ""} onClick={() => setMobileCol(c.s)}>
            {c.label}
            {c.list.length ? <span className="tab-count">{c.list.length}</span> : null}
          </button>
        ))}
      </div>

      <div className="cols">
        {cols.map((c) => (
          <div key={c.s} className={`col${mobileCol === c.s ? " active" : ""}`}>
            <div className="col-head">
              <h2>{c.label}</h2>
              <span className="count">{c.list.length}</span>
            </div>
            <div className="col-list">
              {c.list.length === 0 && <p className="empty">{c.empty}</p>}
              {c.list.map((o) => (
                <OrderCard key={o.id} order={o} fresh={freshSet.has(o.id)} onStatus={setStatus} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function elapsed(ts: number) {
  return Math.max(0, Math.floor((Date.now() - ts) / 60000));
}

function OrderCard({ order, fresh, onStatus }: { order: Order; fresh: boolean; onStatus: (id: string, s: OrderStatus) => void }) {
  const { t, drinkName, formatLabel } = useI18n();
  const [, tick] = useState(0);
  useEffect(() => {
    const i = window.setInterval(() => tick((n) => n + 1), 30000);
    return () => window.clearInterval(i);
  }, []);

  const mins = elapsed(order.createdAt);
  const next: OrderStatus | null = order.status === "pending" ? "making" : order.status === "making" ? "done" : null;
  const prev: OrderStatus | null = order.status === "done" ? "making" : order.status === "making" ? "pending" : null;
  const isDone = order.status === "done";

  const timerClass = isDone ? "idle" : mins >= 10 ? "late" : mins >= 5 ? "warn" : "";

  return (
    <article
      className={`glass rim ocard${order.urgent && !isDone ? " urgent" : ""}${fresh ? " fresh" : ""}${isDone ? " finished" : ""}`}
    >
      <div className="ocard-top">
        <h3>{formatLabel(order.tableLabel)}</h3>
        <span className={`timer ${timerClass}`}>{mins} {t("minutes")}</span>
      </div>
      {order.urgent && !isDone && <span className="badge urgent" style={{ marginBottom: 10 }}>⚡ {t("urgent")}</span>}
      <div>
        {order.items.map((it, i) => (
          <div className="oline" key={i}>
            <DrinkArt drink={it.drink} cold={it.temp === "cold"} lessIce={it.lessIce} size={42} />
            <div>
              <div className="oline-name">
                {it.qty > 1 && <b>{it.qty}×</b>}
                {drinkName(it.drink)}
              </div>
              <div className="line-meta">
                <span className={`tag ${it.temp}`}>{it.temp === "cold" ? t("cold") : t("hot")}</span>
                {it.lessSweet && <span className="tag">{t("lessSweet")}</span>}
                {it.lessIce && <span className="tag">{t("lessIce")}</span>}
                {it.remarks && <span className="tag note">{it.remarks}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="actions">
        {prev && (
          <button className="pill btn-ghost" onClick={() => onStatus(order.id, prev)}>
            {t("undo")}
          </button>
        )}
        {next && (
          <button className="pill btn-foam" onClick={() => onStatus(order.id, next)}>
            {order.status === "pending" ? t("start") : t("finish")}
          </button>
        )}
      </div>
    </article>
  );
}

/* ---------------- floor ---------------- */

function Floor({ config, onSaved }: { config: AppConfig; onSaved: () => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<TableSpot[] | null>(null);
  const tables = draft ?? config.tables;

  return (
    <section className="floor-wrap">
      <p className="muted">{t("editMapHint")}</p>
      <TableMap tables={tables} mode="edit" onChange={setDraft} />
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="pill btn-foam"
          disabled={!draft}
          onClick={async () => { await backend.saveTables(draft ?? []); setDraft(null); onSaved(); }}
        >
          {t("saveMap")}
        </button>
        <button className="pill btn-ghost" onClick={() => setDraft([])}>
          {t("clearMap")}
        </button>
        <span className="muted" style={{ marginLeft: "auto" }}>
          {tables.length} {t("tablesCount")}
        </span>
      </div>
    </section>
  );
}

/* ---------------- menu ---------------- */

function Menu({ config }: { config: AppConfig }) {
  const { t, drinkName } = useI18n();
  return (
    <section>
      <p className="muted" style={{ margin: "0 4px 16px" }}>
        {t("menuHint")}
      </p>
      <div className="menu-grid">
        {DRINKS.map((d) => {
          const sold = Boolean(config.soldOut[d]);
          return (
            <div className="glass rim menu-item" key={d}>
              <DrinkArt drink={d} size={48} />
              <div className="grow">
                <strong>{drinkName(d)}</strong>
                <span className="muted" style={{ fontSize: "0.85rem" }}>
                  {sold ? t("soldOut") : t("available")}
                </span>
              </div>
              <button className={`switch${sold ? " danger" : ""}`} role="switch" aria-checked={sold} aria-label={drinkName(d)} onClick={() => backend.setSoldOut(d, !sold)} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- history ---------------- */

function History({ orders, onArchived }: { orders: Order[]; onArchived: () => void }) {
  const { t, drinkName, formatLabel } = useI18n();

  const drinkTotal = orders.reduce((n, o) => n + o.items.reduce((m, it) => m + it.qty, 0), 0);
  const counts = new Map<DrinkId, number>();
  for (const o of orders) for (const it of o.items) counts.set(it.drink, (counts.get(it.drink) ?? 0) + it.qty);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] ?? 1;

  const endSession = async () => {
    if (window.confirm(t("endSessionConfirm"))) {
      await backend.archiveCompleted();
      onArchived();
    }
  };

  return (
    <section>
      <div className="stats">
        <div className="glass rim stat">
          <strong>{orders.length}</strong>
          <span>{t("statOrders")}</span>
        </div>
        <div className="glass rim stat">
          <strong>{drinkTotal}</strong>
          <span>{t("statDrinks")}</span>
        </div>
      </div>

      {top.length > 0 && (
        <div className="glass rim panel" style={{ marginBottom: 16 }}>
          <h2 className="h2">{t("popular")}</h2>
          <div className="bars">
            {top.map(([d, n]) => (
              <div className="bar-row" key={d}>
                <DrinkArt drink={d} size={34} />
                <div className="bar-track">
                  <i style={{ width: `${(n / max) * 100}%` }} />
                </div>
                <span style={{ fontWeight: 700, textAlign: "right" }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hist-actions">
        <button className="pill btn-foam" onClick={() => downloadCsv(orders)} disabled={orders.length === 0}>
          {t("downloadCsv")}
        </button>
        <button className="pill btn-ghost" onClick={endSession} disabled={!orders.some((o) => o.status === "done" && !o.archived)}>
          {t("endSession")}
        </button>
      </div>

      <h2 className="h2" style={{ margin: "0 4px 10px" }}>
        {t("allOrders")}
      </h2>
      {orders.length === 0 && <p className="empty">{t("nothingYet")}</p>}
      <div className="hist-list">
        {[...orders].reverse().map((o) => (
          <div className={`glass hist-item${o.archived ? " old" : ""}`} key={o.id}>
            <div className="row">
              <strong style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{formatLabel(o.tableLabel)}</strong>
              <span className="muted" style={{ fontSize: "0.82rem" }}>
                {new Date(o.createdAt).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="muted" style={{ marginTop: 4 }}>
              {o.items.map((it) => `${it.qty}× ${drinkName(it.drink)}${it.temp === "cold" ? " ❄" : ""}`).join(", ")}
              {o.urgent && " ⚡"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
