"use client";

/**
 * Firestore data layer. Reads are live (onSnapshot), writes go straight to Firestore.
 * If the Firebase keys are missing, or Firestore refuses access, the problem is
 * reported through subscribeStatus() so the UI can show a clear message.
 */

import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseConfigured, getDb } from "./firebase";
import type { AppConfig, NewOrder, Order, TableSpot, DrinkId } from "./types";
import { EMPTY_CONFIG, decodeTable } from "./types";

/* ---------------- connection status ---------------- */

const MISSING_KEYS =
  "Firebase keys are missing from this deployment. Add the NEXT_PUBLIC_FIREBASE_* variables in Vercel, then Redeploy (README Step 6).";

let status: { error: string | null } = { error: firebaseConfigured ? null : MISSING_KEYS };
const statusListeners = new Set<() => void>();

export function setBackendError(msg: string | null) {
  if (status.error === msg) return;
  status = { error: msg };
  statusListeners.forEach((f) => f());
}

export function subscribeStatus(cb: (s: { error: string | null }) => void) {
  const f = () => cb(status);
  statusListeners.add(f);
  f();
  return () => {
    statusListeners.delete(f);
  };
}

function friendly(e: { code?: string; message: string }): string {
  if (e.code === "permission-denied")
    return "Firestore rules are blocking access. Publish the rules from the README (Step 4).";
  if (e.code === "failed-precondition" || /not.*exist|NOT_FOUND/i.test(e.message))
    return "The Firestore database has not been created yet (README Step 3).";
  return `${e.code ?? "error"}: ${e.message}`;
}

const onErr = (e: { code?: string; message: string }) => setBackendError(friendly(e));

function requireFirebase() {
  if (!firebaseConfigured) throw new Error(MISSING_KEYS);
  return getDb();
}

/* ---------------- backend ---------------- */

export interface Backend {
  subscribeOrders(cb: (orders: Order[]) => void): () => void;
  addOrder(o: NewOrder): Promise<string>;
  updateOrder(id: string, patch: Partial<Omit<Order, "id">>): Promise<void>;
  removeOrder(id: string): Promise<void>;
  /** Archives every live order, so the board and the session counters start fresh. */
  endSession(): Promise<void>;
  subscribeConfig(cb: (cfg: AppConfig) => void): () => void;
  saveTables(tables: TableSpot[]): Promise<void>;
  setSoldOut(drink: DrinkId, v: boolean): Promise<void>;
}

export const backend: Backend = {
  subscribeOrders(cb) {
    if (!firebaseConfigured) {
      cb([]);
      return () => {};
    }
    return onSnapshot(
      collection(getDb(), "orders"),
      (snap) => {
        setBackendError(null);
        const orders: Order[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as NewOrder) }));
        orders.sort((a, b) => a.createdAt - b.createdAt);
        cb(orders);
      },
      onErr
    );
  },

  async addOrder(o) {
    const ref = await addDoc(collection(requireFirebase(), "orders"), o);
    return ref.id;
  },

  async updateOrder(id, patch) {
    await updateDoc(doc(requireFirebase(), "orders", id), patch);
  },

  async removeOrder(id) {
    await deleteDoc(doc(requireFirebase(), "orders", id));
  },

  async endSession() {
    const db = requireFirebase();
    const snap = await getDocs(query(collection(db, "orders"), where("archived", "==", false)));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { archived: true }));
    await batch.commit();
  },

  subscribeConfig(cb) {
    if (!firebaseConfigured) {
      cb(EMPTY_CONFIG);
      return () => {};
    }
    return onSnapshot(
      doc(getDb(), "config", "app"),
      (snap) => {
        setBackendError(null);
        cb(snap.exists() ? { ...EMPTY_CONFIG, ...(snap.data() as AppConfig) } : EMPTY_CONFIG);
      },
      onErr
    );
  },

  async saveTables(tables) {
    await setDoc(doc(requireFirebase(), "config", "app"), { tables }, { merge: true });
  },

  async setSoldOut(drink, v) {
    await setDoc(doc(requireFirebase(), "config", "app"), { soldOut: { [drink]: v } }, { merge: true });
  },
};

/* ---------------- CSV export ---------------- */

export function ordersToCsv(orders: Order[]): string {
  const rows = [
    ["Time", "Table / name", "Drink", "Temp", "Less sweet", "Less ice", "Qty", "Remarks", "Urgent", "Status", "Archived"],
  ];
  for (const o of orders) {
    const n = decodeTable(o.tableLabel);
    const label = n !== null ? `Table ${n}` : o.tableLabel;
    for (const it of o.items) {
      rows.push([
        new Date(o.createdAt).toLocaleString("en-MY"),
        label,
        it.drink,
        it.temp,
        it.lessSweet ? "yes" : "",
        it.lessIce ? "yes" : "",
        String(it.qty),
        it.remarks,
        o.urgent ? "yes" : "",
        o.status,
        o.archived ? "yes" : "",
      ]);
    }
  }
  return rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
}

export function downloadCsv(orders: Order[]) {
  const blob = new Blob(["﻿" + ordersToCsv(orders)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tjc-coffee-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}