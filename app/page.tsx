"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DRINKS,
  type DrinkId,
  type OrderItem,
  type Order,
  type TableSpot,
  type AppConfig,
  EMPTY_CONFIG,
  encodeTable,
} from "@/lib/types";
import { backend } from "@/lib/data";
import { useI18n, LangToggle } from "@/lib/i18n";
import TopBar from "@/components/TopBar";
import StatusBar from "@/components/StatusBar";
import TableMap from "@/components/TableMap";
import DrinkArt from "@/components/DrinkArt";
import DrinkSheet from "@/components/DrinkSheet";

const MINE_KEY = "tjc-my-orders";

function readMine(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(MINE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function WaiterPage() {
  const { t, drinkName, formatLabel } = useI18n();

  const [config, setConfig] = useState<AppConfig>(EMPTY_CONFIG);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mineIds, setMineIds] = useState<string[]>([]);

  const [table, setTable] = useState<TableSpot | null>(null);
  const [name, setName] = useState("");
  const [sheet, setSheet] = useState<DrinkId | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMineIds(readMine());
    const u1 = backend.subscribeConfig(setConfig);
    const u2 = backend.subscribeOrders(setOrders);
    return () => {
      u1();
      u2();
    };
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  const label = name.trim() ? name.trim() : table ? encodeTable(table.n) : "";
  const totalDrinks = cart.reduce((n, it) => n + it.qty, 0);

  const addItem = (it: OrderItem) => {
    setCart((c) => [...c, it]);
    setSheet(null);
  };

  const send = async () => {
    if (!label || cart.length === 0 || sending) return;
    setSending(true);
    try {
      const id = await backend.addOrder({
        tableLabel: label,
        items: cart,
        urgent,
        status: "pending",
        createdAt: Date.now(),
        archived: false,
      });
      const ids = [...readMine(), id];
      window.localStorage.setItem(MINE_KEY, JSON.stringify(ids));
      setMineIds(ids);
      setCart([]);
      setUrgent(false);
      setName("");
      setTable(null);
      setSent(true);
      window.setTimeout(() => setSent(false), 1900);
    } catch (e) {
      showToast(`${t("sendFailed")}: ${e instanceof Error ? e.message : ""}`);
    } finally {
      setSending(false);
    }
  };

  const mine = useMemo(
    () => orders.filter((o) => mineIds.includes(o.id) && !o.archived).reverse(),
    [orders, mineIds]
  );

  const heroWords = t("heroTitle").split(" ");

  return (
    <div className="page">
      <TopBar>
        <LangToggle />
        <Link href="/barista" className="pill btn-ghost" style={{ minHeight: 42, padding: "0 16px", fontSize: "0.9rem" }}>
          {t("imBarista")}
        </Link>
      </TopBar>

      <StatusBar />

      <div className="waiter-grid">
        <div className="col-left">
          <section className="hero">
            <h1 className="hero-title">
              {heroWords.map((w, i) => (
                <span className="w" style={{ "--i": i } as React.CSSProperties} key={i}>
                  {w}
                </span>
              ))}
            </h1>
            <p className="hero-sub">{t("heroSub")}</p>
          </section>

          <section className="glass panel" aria-label={t("whereTitle")}>
            <h2 className="h2">{t("whereTitle")}</h2>
            {config.tables.length > 0 ? (
              <>
                <p className="muted" style={{ marginBottom: 12 }}>
                  {t("tapTable")}
                </p>
                <TableMap tables={config.tables} mode="pick" selectedId={table?.id ?? null} onPick={(tb) => { setTable(tb); setName(""); }} />
                <p className="muted" style={{ margin: "14px 0 8px" }}>
                  {t("orTypeName")}
                </p>
              </>
            ) : (
              <p className="muted" style={{ marginBottom: 10 }}>
                {t("noMapYet")}
              </p>
            )}
            <input
              className="field"
              value={name}
              onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setTable(null); }}
              placeholder={t("namePlaceholder")}
            />
            {label && (
              <div className="dest">
                <span>{t("orderingFor")}</span>
                <strong>{formatLabel(label)}</strong>
              </div>
            )}
          </section>
        </div>

        <div className="col-right">
          <section aria-label={t("drinksTitle")}>
            <h2 className="h2" style={{ margin: "0 4px 14px" }}>
              {t("drinksTitle")}
            </h2>
            <div className="drink-grid">
              {DRINKS.map((d, i) => {
                const sold = Boolean(config.soldOut[d]);
                return (
                  <button
                    key={d}
                    className="drink glass rim"
                    style={{ "--i": i } as React.CSSProperties}
                    disabled={sold}
                    onClick={() => setSheet(d)}
                  >
                    {sold && <span className="badge sold">{t("soldOut")}</span>}
                    <DrinkArt className="drink-art" drink={d} size={92} />
                    <span className="drink-name">{drinkName(d)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {cart.length > 0 && (
            <section className="glass panel" aria-label={t("yourOrder")}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <h2 className="h2" style={{ margin: 0 }}>
                  {t("yourOrder")}
                </h2>
                <span className="muted">
                  {totalDrinks} {t("drinksCount")}
                </span>
              </div>
              {cart.map((it, i) => (
                <div className="order-line" key={i}>
                  <DrinkArt drink={it.drink} cold={it.temp === "cold"} lessIce={it.lessIce} size={48} />
                  <div style={{ minWidth: 0 }}>
                    <div className="line-name">
                      {it.qty > 1 && <b style={{ color: "var(--peach)" }}>{it.qty}× </b>}
                      {drinkName(it.drink)}
                    </div>
                    <div className="line-meta">
                      <span className={`tag ${it.temp}`}>{it.temp === "cold" ? t("cold") : t("hot")}</span>
                      {it.lessSweet && <span className="tag">{t("lessSweet")}</span>}
                      {it.lessIce && <span className="tag">{t("lessIce")}</span>}
                      {it.remarks && <span className="tag note">{it.remarks}</span>}
                    </div>
                  </div>
                  <button className="icon-btn" aria-label={t("remove")} onClick={() => setCart((c) => c.filter((_, j) => j !== i))}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                  </button>
                </div>
              ))}

              <button className="switch-row" onClick={() => setUrgent(!urgent)} style={{ width: "100%", textAlign: "left", marginTop: 14 }}>
                <span>
                  <strong>⚡ {t("urgent")}</strong>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>
                    {t("urgentHint")}
                  </span>
                </span>
                <span className={`switch danger`} role="switch" aria-checked={urgent} />
              </button>
            </section>
          )}

          {mine.length > 0 && (
            <section aria-label={t("myOrders")}>
              <h2 className="h2" style={{ margin: "0 4px 14px" }}>
                {t("myOrders")}
              </h2>
              <div className="myorders">
                {mine.map((o) => (
                  <MyOrder key={o.id} order={o} onCancel={() => backend.removeOrder(o.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="cartbar glass rim">
          <div className="cart-info">
            <div className="cart-stack">
              {cart.slice(0, 3).map((it, i) => (
                <DrinkArt key={i} drink={it.drink} cold={it.temp === "cold"} size={40} />
              ))}
            </div>
            <div className="cart-text">
              <strong>{totalDrinks} {t("drinksCount")}</strong>
              <span>{label ? formatLabel(label) : t("chooseWhereFirst")}</span>
            </div>
          </div>
          <button className="pill btn-foam" disabled={!label || sending} onClick={send}>
            {t("sendOrder")}
          </button>
        </div>
      )}

      {sheet && <DrinkSheet drink={sheet} onClose={() => setSheet(null)} onAdd={addItem} />}

      {toast && <div className="toast">{toast}</div>}

      {sent && (
        <div className="sent" role="status">
          <div className="sent-inner">
            <svg width="130" height="130" viewBox="0 0 64 64" fill="none">
              <defs>
                <clipPath id="sentclip">
                  <path d="M14 26h30v10a14 14 0 0 1-14 14h-2a14 14 0 0 1-14-14z" />
                </clipPath>
                <linearGradient id="sentg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f7e6d6" />
                  <stop offset="1" stopColor="#f0b27a" />
                </linearGradient>
              </defs>
              <path d="M14 26h30v10a14 14 0 0 1-14 14h-2a14 14 0 0 1-14-14z" fill="rgba(255,255,255,0.08)" />
              <g clipPath="url(#sentclip)">
                <rect className="fill" x="10" y="26" width="40" height="30" fill="url(#sentg)" />
              </g>
              <path d="M44 29h4a5 5 0 0 1 0 10h-4" stroke="url(#sentg)" strokeWidth="4" />
              <path className="steam" d="M24 10c-3 3 3 5 0 9M32 10c-3 3 3 5 0 9" stroke="#f6efe6" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p className="sent-title">{t("orderSent")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MyOrder({ order, onCancel }: { order: Order; onCancel: () => void }) {
  const { t, drinkName, formatLabel } = useI18n();
  const [confirm, setConfirm] = useState(false);

  const step = order.status === "pending" ? 1 : order.status === "making" ? 2 : 3;
  const statusLabel = order.status === "pending" ? t("pending") : order.status === "making" ? t("making") : t("done");

  return (
    <article className={`glass myorder${order.status === "done" ? " ready" : ""}`}>
      <div className="myorder-head">
        <strong>{formatLabel(order.tableLabel)}</strong>
        {order.urgent && <span className="badge urgent">⚡ {t("urgent")}</span>}
      </div>
      <div className="myorder-items">{order.items.map((it) => `${it.qty}× ${drinkName(it.drink)}`).join(", ")}</div>
      <div className="track">
        <i className={step >= 1 ? `on${step === 1 ? " now" : ""}` : ""} />
        <i className={step >= 2 ? `on${step === 2 ? " now" : ""}` : ""} />
        <i className={step >= 3 ? "on last" : ""} />
      </div>
      <div className="track-label">
        <span style={{ color: order.status === "done" ? "var(--ok)" : "var(--peach)" }}>
          {order.status === "done" ? `✓ ${formatLabel(order.tableLabel)} ${t("readyMsg")}` : statusLabel}
        </span>
        {order.status === "pending" &&
          (confirm ? (
            <button className="link-btn warn" onClick={onCancel}>
              {t("cancelConfirm")}
            </button>
          ) : (
            <button className="link-btn" onClick={() => { setConfirm(true); window.setTimeout(() => setConfirm(false), 3000); }}>
              {t("cancelOrder")}
            </button>
          ))}
      </div>
    </article>
  );
}
