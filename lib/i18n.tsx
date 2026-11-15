"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeTable, type DrinkId } from "./types";

export type Lang = "en" | "zh" | "ms";

const en = {
  appName: "TJC Seremban Coffee",
  brandShort: "TJC Coffee",
  heroTitle: "What are we pouring?",
  heroSub: "Pick a table, choose the drinks, send. The barista sees it instantly.",
  imBarista: "I'm a barista",

  whereTitle: "Where is this order for?",
  tapTable: "Tap your table on the map",
  front: "Front",
  orTypeName: "or type a name or place",
  namePlaceholder: "e.g. Bro Daniel, near the piano",
  noMapYet: "No table map yet. Type a name or place below.",
  orderingFor: "Ordering for",

  drinksTitle: "Drinks",
  hot: "Hot",
  cold: "Cold",
  lessSweet: "Less sweet",
  lessIce: "Less ice",
  remarks: "Remarks",
  remarksPlaceholder: "e.g. extra shot, no foam",
  qty: "Quantity",
  add: "Add to order",
  soldOut: "Sold out",

  yourOrder: "Your order",
  drinksCount: "drinks",
  urgent: "Urgent",
  urgentHint: "Barista sees it first",
  sendOrder: "Send order",
  chooseWhereFirst: "Choose a table or type a name first",
  orderSent: "Order sent",
  sendFailed: "Could not send",
  remove: "Remove",

  myOrders: "My orders",
  pending: "Waiting",
  making: "Making",
  done: "Ready",
  readyMsg: "is ready to collect",
  cancelOrder: "Cancel",
  cancelConfirm: "Tap again to cancel",
  clear: "Clear",

  loginTitle: "Barista sign in",
  enterPin: "Enter PIN",
  wrongPin: "Wrong PIN, try again.",
  signIn: "Sign in",
  backToOrder: "Back to ordering",

  baristaTitle: "Barista board",
  tabOrders: "Orders",
  tabFloor: "Floor map",
  tabMenu: "Menu",
  tabHistory: "History",
  start: "Start",
  finish: "Done",
  undo: "Undo",
  emptyWaiting: "Nothing waiting. New orders appear here with a chime.",
  emptyMaking: "Nothing in progress.",
  emptyDone: "Finished orders stay here until you end the session.",
  minutes: "min",
  soundOn: "Sound on",
  soundOff: "Sound off",
  logout: "Log out",

  editMapHint: "Tap empty floor to add a table. Drag to move. Double-tap a table to remove it.",
  saveMap: "Save map",
  mapSaved: "Map saved",
  clearMap: "Clear map",
  tablesCount: "tables",

  menuHint: "Switch a drink to sold out and waiters can no longer order it.",
  available: "Available",

  statOrders: "Orders",
  statDrinks: "Drinks",
  popular: "Most ordered",
  allOrders: "All orders",
  downloadCsv: "Download CSV",
  endSession: "End session",
  endSessionConfirm: "Archive all finished orders? They stay in History and in the CSV.",
  archived: "Archived",
  nothingYet: "Nothing here yet.",
} as const;

export type StringKey = keyof typeof en;
type Dict = Record<StringKey, string>;

const zh: Dict = {
  appName: "TJC 芙蓉咖啡",
  brandShort: "芙蓉咖啡",
  heroTitle: "来杯什么？",
  heroSub: "选桌位，点饮品，送出。咖啡师马上就能看到。",
  imBarista: "我是咖啡师",

  whereTitle: "这单送到哪里？",
  tapTable: "在地图上点选您的桌位",
  front: "前方",
  orTypeName: "或输入名字或位置",
  namePlaceholder: "例：Daniel 弟兄，钢琴旁",
  noMapYet: "还没有桌位图，请在下面输入名字或位置。",
  orderingFor: "送往",

  drinksTitle: "饮品",
  hot: "热",
  cold: "冰",
  lessSweet: "少甜",
  lessIce: "少冰",
  remarks: "备注",
  remarksPlaceholder: "例：加浓，不要奶泡",
  qty: "数量",
  add: "加入订单",
  soldOut: "售完",

  yourOrder: "您的订单",
  drinksCount: "杯",
  urgent: "加急",
  urgentHint: "咖啡师优先处理",
  sendOrder: "送出订单",
  chooseWhereFirst: "请先选桌位或输入名字",
  orderSent: "订单已送出",
  sendFailed: "发送失败",
  remove: "移除",

  myOrders: "我的订单",
  pending: "等待中",
  making: "制作中",
  done: "可取",
  readyMsg: "可以取了",
  cancelOrder: "取消",
  cancelConfirm: "再点一次确认取消",
  clear: "清除",

  loginTitle: "咖啡师登录",
  enterPin: "输入密码",
  wrongPin: "密码不对，请重试。",
  signIn: "登录",
  backToOrder: "回到点单",

  baristaTitle: "咖啡师看板",
  tabOrders: "订单",
  tabFloor: "桌位图",
  tabMenu: "菜单",
  tabHistory: "历史",
  start: "开始",
  finish: "完成",
  undo: "撤销",
  emptyWaiting: "没有待做的订单，新订单会响铃提示。",
  emptyMaking: "没有正在制作的订单。",
  emptyDone: "完成的订单会保留在这里，直到您结束本场。",
  minutes: "分钟",
  soundOn: "声音开",
  soundOff: "声音关",
  logout: "退出",

  editMapHint: "点空白处新增桌子，拖动移动，双击删除。",
  saveMap: "保存地图",
  mapSaved: "地图已保存",
  clearMap: "清空地图",
  tablesCount: "张桌子",

  menuHint: "把饮品设为售完，服务员就不能再点。",
  available: "可点",

  statOrders: "订单",
  statDrinks: "饮品",
  popular: "最热门",
  allOrders: "全部订单",
  downloadCsv: "下载 CSV",
  endSession: "结束本场",
  endSessionConfirm: "把所有已完成的订单归档？它们仍保留在历史和 CSV 中。",
  archived: "已归档",
  nothingYet: "暂时没有内容。",
};

const ms: Dict = {
  appName: "Kopi TJC Seremban",
  brandShort: "Kopi TJC",
  heroTitle: "Nak minum apa?",
  heroSub: "Pilih meja, pilih minuman, hantar. Barista nampak serta-merta.",
  imBarista: "Saya barista",

  whereTitle: "Pesanan ini untuk di mana?",
  tapTable: "Tekan meja anda pada peta",
  front: "Hadapan",
  orTypeName: "atau taip nama atau tempat",
  namePlaceholder: "cth: Saudara Daniel, dekat piano",
  noMapYet: "Belum ada peta meja. Taip nama atau tempat di bawah.",
  orderingFor: "Untuk",

  drinksTitle: "Minuman",
  hot: "Panas",
  cold: "Sejuk",
  lessSweet: "Kurang manis",
  lessIce: "Kurang ais",
  remarks: "Catatan",
  remarksPlaceholder: "cth: tambah shot, tanpa buih",
  qty: "Kuantiti",
  add: "Tambah ke pesanan",
  soldOut: "Habis",

  yourOrder: "Pesanan anda",
  drinksCount: "minuman",
  urgent: "Segera",
  urgentHint: "Barista utamakan",
  sendOrder: "Hantar pesanan",
  chooseWhereFirst: "Pilih meja atau taip nama dahulu",
  orderSent: "Pesanan dihantar",
  sendFailed: "Gagal menghantar",
  remove: "Buang",

  myOrders: "Pesanan saya",
  pending: "Menunggu",
  making: "Sedang dibuat",
  done: "Sedia",
  readyMsg: "sedia diambil",
  cancelOrder: "Batal",
  cancelConfirm: "Tekan lagi untuk batal",
  clear: "Kosongkan",

  loginTitle: "Log masuk barista",
  enterPin: "Masukkan PIN",
  wrongPin: "PIN salah, cuba lagi.",
  signIn: "Log masuk",
  backToOrder: "Kembali ke pesanan",

  baristaTitle: "Papan barista",
  tabOrders: "Pesanan",
  tabFloor: "Peta meja",
  tabMenu: "Menu",
  tabHistory: "Sejarah",
  start: "Mula",
  finish: "Siap",
  undo: "Undur",
  emptyWaiting: "Tiada pesanan menunggu. Pesanan baru muncul di sini dengan bunyi.",
  emptyMaking: "Tiada yang sedang dibuat.",
  emptyDone: "Pesanan siap kekal di sini sehingga sesi ditamatkan.",
  minutes: "min",
  soundOn: "Bunyi hidup",
  soundOff: "Bunyi mati",
  logout: "Log keluar",

  editMapHint: "Tekan ruang kosong untuk tambah meja. Seret untuk alih. Tekan dua kali untuk buang.",
  saveMap: "Simpan peta",
  mapSaved: "Peta disimpan",
  clearMap: "Kosongkan peta",
  tablesCount: "meja",

  menuHint: "Tandakan minuman sebagai habis dan pelayan tidak boleh memesannya lagi.",
  available: "Ada",

  statOrders: "Pesanan",
  statDrinks: "Minuman",
  popular: "Paling popular",
  allOrders: "Semua pesanan",
  downloadCsv: "Muat turun CSV",
  endSession: "Tamat sesi",
  endSessionConfirm: "Arkibkan semua pesanan siap? Ia kekal dalam Sejarah dan CSV.",
  archived: "Diarkib",
  nothingYet: "Tiada apa-apa lagi.",
};

const STRINGS: Record<Lang, Dict> = { en, zh, ms };

export const DRINK_NAMES: Record<Lang, Record<DrinkId, string>> = {
  en: {
    espresso: "Espresso",
    latte: "Latte",
    americano: "Americano",
    longblack: "Long Black",
    cappuccino: "Cappuccino",
    mocha: "Mocha",
    chocolate: "Chocolate",
  },
  zh: {
    espresso: "浓缩咖啡",
    latte: "拿铁",
    americano: "美式",
    longblack: "长黑",
    cappuccino: "卡布奇诺",
    mocha: "摩卡",
    chocolate: "巧克力",
  },
  ms: {
    espresso: "Espresso",
    latte: "Latte",
    americano: "Americano",
    longblack: "Long Black",
    cappuccino: "Cappuccino",
    mocha: "Mocha",
    chocolate: "Coklat",
  },
};

const TABLE_NAME: Record<Lang, (n: number) => string> = {
  en: (n) => `Table ${n}`,
  zh: (n) => `${n} 号桌`,
  ms: (n) => `Meja ${n}`,
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
  drinkName: (d: DrinkId) => string;
  tableName: (n: number) => string;
  /** Turns a stored label ("@4" or a free-text name) into display text. */
  formatLabel: (label: string) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k],
  drinkName: (d) => DRINK_NAMES.en[d],
  tableName: (n) => TABLE_NAME.en(n),
  formatLabel: (l) => l,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("tjc-lang");
    if (saved === "en" || saved === "zh" || saved === "ms") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang === "ms" ? "ms" : "en";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("tjc-lang", l);
  };

  const value: I18nCtx = {
    lang,
    setLang,
    t: (k) => STRINGS[lang][k] ?? en[k],
    drinkName: (d) => DRINK_NAMES[lang][d],
    tableName: (n) => TABLE_NAME[lang](n),
    formatLabel: (label) => {
      const n = decodeTable(label);
      return n !== null ? TABLE_NAME[lang](n) : label;
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function LangToggle() {
  const { lang, setLang } = useI18n();
  const opts: { v: Lang; label: string }[] = [
    { v: "en", label: "EN" },
    { v: "zh", label: "中文" },
    { v: "ms", label: "BM" },
  ];
  return (
    <div className="seg lang" role="group" aria-label="Language">
      {opts.map((o) => (
        <button key={o.v} className={lang === o.v ? "on" : ""} aria-pressed={lang === o.v} onClick={() => setLang(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
