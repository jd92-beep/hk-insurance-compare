import { toast } from "sonner";
import { copyShareText, legacyCopyShareText } from "./share-link";

/** Clipboard success = fulfilled write, never a fire-and-forget attempt. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return copyShareText(text, (value) => navigator.clipboard.writeText(value), legacyCopyShareText);
  }
  return copyShareText(text, undefined, legacyCopyShareText);
}

/** Louder, longer feedback for user actions (compare / promo / export). */
export function toastPromoCopy(ok: boolean, code: string): void {
  if (ok) {
    toast.success(`✅ 已複製優惠碼：${code}`, {
      position: "top-center",
      duration: 4500,
      style: { fontSize: "15px", fontWeight: 700, padding: "14px 18px" },
    });
    return;
  }
  toast.error(`未能自動複製優惠碼 ${code}，請手動抄低後到官網使用。`, {
    position: "top-center",
    duration: 6000,
    style: { fontSize: "14px", fontWeight: 700, padding: "14px 18px" },
  });
}

export function toastCompareToggle(productLabel: string, added: boolean, blocked = false): void {
  if (blocked) {
    toast.error(`比較車最多 3 份。請先移除一份，再加入「${productLabel}」。`, {
      position: "top-center",
      duration: 5000,
      style: { fontSize: "14px", fontWeight: 700, padding: "14px 18px" },
    });
    return;
  }
  if (added) {
    toast.success(`⚖️ 已加入比較：${productLabel}`, {
      position: "top-center",
      duration: 4000,
      style: { fontSize: "15px", fontWeight: 700, padding: "14px 18px" },
    });
    return;
  }
  toast(`已由比較移除：${productLabel}`, {
    position: "top-center",
    duration: 3500,
    style: { fontSize: "14px", fontWeight: 600, padding: "12px 16px" },
  });
}

export function toastFavoriteToggle(productLabel: string, added: boolean): void {
  if (added) {
    toast.success(`❤️ 已加入我的最愛：${productLabel}`, {
      position: "top-center",
      duration: 3500,
      style: { fontSize: "15px", fontWeight: 700, padding: "14px 18px" },
    });
    return;
  }
  toast(`已從我的最愛移除：${productLabel}`, {
    position: "top-center",
    duration: 3000,
    style: { fontSize: "14px", fontWeight: 600, padding: "12px 16px" },
  });
}

