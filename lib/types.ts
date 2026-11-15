export const DRINKS = [
  "espresso",
  "latte",
  "americano",
  "longblack",
  "cappuccino",
  "mocha",
  "chocolate",
] as const;

export type DrinkId = (typeof DRINKS)[number];

export type Temp = "hot" | "cold";

export interface OrderItem {
  drink: DrinkId;
  temp: Temp;
  lessSweet: boolean;
  lessIce: boolean;
  qty: number;
  remarks: string;
}

export type OrderStatus = "pending" | "making" | "done";

export interface Order {
  id: string;
  /** "@4" for table 4, otherwise a free-text name or place */
  tableLabel: string;
  items: OrderItem[];
  urgent: boolean;
  status: OrderStatus;
  createdAt: number; // epoch ms
  archived: boolean;
}

export type NewOrder = Omit<Order, "id">;

export interface TableSpot {
  id: string;
  n: number; // displayed number
  x: number; // 0..1, relative to map width
  y: number; // 0..1
}

export interface AppConfig {
  tables: TableSpot[];
  soldOut: Partial<Record<DrinkId, boolean>>;
}

export const EMPTY_CONFIG: AppConfig = { tables: [], soldOut: {} };

/* Table orders are stored as "@4" so each screen can show them in its own language. */
export const encodeTable = (n: number) => `@${n}`;

export function decodeTable(label: string): number | null {
  const m = /^@(\d+)$/.exec(label.trim());
  return m ? Number(m[1]) : null;
}
