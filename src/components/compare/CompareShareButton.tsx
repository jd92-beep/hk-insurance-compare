import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Link2, X } from "lucide-react";
import { comparisonShareUrl, copyShareText, legacyCopyShareText } from "@/lib/share-link";
import { getLenis } from "@/lib/lenis";

/** Changing the visible selection resets old success/manual-copy state. */
export default function CompareShareButton(props: { ids: string[]; className?: string }) {
  return <ShareSession key={props.ids.join(",")} {...props} />;
}
function ShareSession({ ids, className }: { ids: string[]; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const active = useRef(true);
  const inputId = useId();
  const label = busy ? "正在複製…" : copied ? "連結已複製" : "複製比較連結";
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (!manualUrl) return;
    const lenis = getLenis(); const wasStopped = lenis?.isStopped;
    lenis?.stop();
    return () => { if (lenis && getLenis() === lenis && !wasStopped) lenis.start(); };
  }, [manualUrl]);
  const copy = async () => {
    if (busy) return;
    setBusy(true); setCopied(false);
    const url = comparisonShareUrl(window.location.origin, ids);
    const writer = navigator.clipboard?.writeText ? (text: string) => navigator.clipboard.writeText(text) : undefined;
    const success = await copyShareText(url, writer, legacyCopyShareText);
    if (!active.current) return;
    setBusy(false); setCopied(success);
    if (!success) setManualUrl(url);
  };
  return <>
    <button ref={button} type="button" onClick={copy} disabled={busy || ids.length === 0} aria-busy={busy} aria-label={label} className={className ?? "btn-ghost min-h-11"} style={{ borderColor: "var(--line-strong)" }}>
      {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
      <span>{label}</span>
    </button>
    <span className="sr-only" role="status" aria-live="polite">{copied ? "連結已複製" : ""}</span>
    <Dialog.Root open={Boolean(manualUrl)} onOpenChange={open => { if (!open) setManualUrl(""); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-card border bg-paper p-6 shadow-lift outline-none" data-lenis-prevent
          onOpenAutoFocus={event => { event.preventDefault(); field.current?.focus(); field.current?.select(); }}
          onCloseAutoFocus={event => { event.preventDefault(); button.current?.focus(); }}>
          <Dialog.Title className="pr-8 font-serif text-xl font-bold text-ink">手動複製比較連結</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-ink-soft">瀏覽器未有確認複製成功。請選取以下網址，按 Ctrl／⌘ + C，或在手機長按後選擇複製。</Dialog.Description>
          <label htmlFor={inputId} className="mt-5 block text-sm font-bold text-ink">比較分享網址</label>
          <input ref={field} id={inputId} value={manualUrl} readOnly onFocus={event => event.currentTarget.select()} className="mt-2 min-h-11 w-full rounded-lg border bg-paper-2 px-3 font-grotesk text-sm text-ink focus:ring-2 focus:ring-jade" />
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button className="btn-ghost min-h-11" onClick={() => { field.current?.focus(); field.current?.select(); }}>全選連結</button>
            <Dialog.Close className="btn-primary min-h-11">關閉</Dialog.Close>
          </div>
          <Dialog.Close className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-ink-soft hover:bg-paper-2 focus-visible:ring-2 focus-visible:ring-jade" aria-label="關閉手動複製視窗"><X size={18} /></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
