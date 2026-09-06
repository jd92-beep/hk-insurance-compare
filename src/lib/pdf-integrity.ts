import { PDF_DOCUMENT_HASHES } from "./generated/pdf-manifest.ts";

export const MAX_PDF_BYTES = 32 * 1024 * 1024;
export function mirroredPdfHash(url: string, versions: Readonly<Record<string, string>> = PDF_DOCUMENT_HASHES): string | undefined {
  const hash = versions[url.split("#")[0]];
  return typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash) ? hash : undefined;
}
/** Verify before handing these exact bytes to PDF.js; no second unverified request. */
export async function verifyPdfBytes(bytes: Uint8Array<ArrayBuffer>, expectedHash: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) throw new Error("文件未有有效版本指紋，未開啟高亮閱讀器。");
  if (bytes.byteLength > MAX_PDF_BYTES) throw new Error("PDF 超出安全閱讀大小，請使用原檔連結。");
  if (new TextDecoder().decode(bytes.subarray(0,5)) !== "%PDF-") throw new Error("下載內容並非 PDF，未有載入。");
  if (!globalThis.crypto?.subtle) throw new Error("此瀏覽器未能核對文件版本，請使用原檔連結。");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("");
  if (actual !== expectedHash) throw new Error("PDF 文件版本不符，已停止載入及高亮。請重新整理或核對原檔，唔好沿用舊頁碼。");
}
export async function loadVerifiedPdf(url: string, signal: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
  const expected = mirroredPdfHash(url);
  if (!expected) throw new Error("此文件未列入本站版本清單，請使用來源原檔核對。");
  signal.throwIfAborted();
  const response = await fetch(url, {signal, mode:"same-origin", credentials:"same-origin", redirect:"error"});
  if (!response.ok || !response.body) throw new Error("未能下載 PDF，請使用原檔連結或稍後重試。");
  if (Number(response.headers.get("content-length")) > MAX_PDF_BYTES) {
    await response.body.cancel(); throw new Error("PDF 超出安全閱讀大小，請使用原檔連結。");
  }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const {done,value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PDF_BYTES) throw new Error("PDF 超出安全閱讀大小，請使用原檔連結。");
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
  signal.throwIfAborted(); await verifyPdfBytes(bytes,expected); signal.throwIfAborted();
  return bytes;
}
