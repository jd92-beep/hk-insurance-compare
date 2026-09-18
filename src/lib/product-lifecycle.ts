import { pastOrToday, snapshotDate } from "./calendar-date.ts";
import type { Product } from "../types/insurance";

export type ProductRecordStatus = "active" | "unverified" | "discontinued" | "archived";

export interface ProductLifecycle {
  status: ProductRecordStatus;
  statusLabel: string;
  lastVerifiedAt: string | null;
  sourceDocumentVersion: string | null;
  /** Snapshot date is not a policy effective date. */
  snapshotNote: string;
}

const STATUS_LABEL: Record<ProductRecordStatus, string> = {
  active: "站內狀態：收錄中",
  unverified: "內容最新性：未核實",
  discontinued: "站內狀態：可能已停售（待覆核）",
  archived: "站內狀態：歸檔參考",
};

function normalizeStatus(value: unknown): ProductRecordStatus {
  return value === "active" || value === "discontinued" || value === "archived" ? value : "unverified";
}

/**
 * Lifecycle metadata is optional in the snapshot. Absent fields stay unknown —
 * never invent verification dates or claim a product is currently on sale.
 */
export function productLifecycle(product: Product, generatedAt?: string, now: Date = new Date()): ProductLifecycle {
  const status = normalizeStatus(product.record_status);
  return {
    status,
    statusLabel: STATUS_LABEL[status],
    lastVerifiedAt: pastOrToday(product.last_verified_at, now),
    sourceDocumentVersion:
      typeof product.source_document_version === "string" && product.source_document_version
        ? product.source_document_version
        : null,
    snapshotNote: snapshotDate(generatedAt)
      ? `資料快照：${generatedAt}（唔係條款生效或停售日期）`
      : "資料快照日期未提供",
  };
}
