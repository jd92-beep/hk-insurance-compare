import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import type { GlossaryEntry } from "@/lib/glossary";
import {
  GLOSSARY_MORE_HREF,
  glossaryTitle,
  splitByGlossary,
} from "@/lib/glossary";
import { cn } from "@/lib/utils";

const POP_ID_PREFIX = "glossary-pop-";

/**
 * 文中詞彙：abbr（含 title）＋可選點擊 popover。
 * interactive=false 時只用 abbr，方便嵌喺其他 button 入面（避免巢狀互動元素）。
 * 定義只係教育資訊，唔代表任何特定保單一定有呢項保障。
 */
export default function GlossaryTerm({
  entry,
  children,
  interactive = true,
}: {
  entry: GlossaryEntry;
  children?: ReactNode;
  interactive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const title = glossaryTitle(entry);
  const label = children ?? entry.term;
  const popId = `${POP_ID_PREFIX}${entry.id}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const markClass =
    "cursor-help underline decoration-dotted decoration-jade/70 underline-offset-2";

  if (!interactive) {
    return (
      <abbr title={title} className={markClass}>
        {label}
      </abbr>
    );
  }

  return (
    <span ref={wrapperRef} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        title={title}
        className={cn(markClass, "transition-colors hover:text-jade")}
      >
        {label}
      </button>
      {open && (
        <span
          id={popId}
          role="note"
          className="absolute left-0 top-[calc(100%+6px)] z-40 w-[min(18rem,70vw)] rounded-[10px] border bg-paper p-3 text-small leading-relaxed shadow-lg"
          style={{ borderColor: "var(--line)" }}
        >
          <span className="block font-grotesk text-[11px] font-medium uppercase tracking-[0.08em] text-red">
            {entry.en}
          </span>
          <span className="mt-1 block text-ink">{entry.definition}</span>
          <span className="mt-2 block text-ink-faint">
            詞義只作教育用途，唔代表任何保單一定有呢項保障。
          </span>
          <Link
            to={GLOSSARY_MORE_HREF}
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-red hover:underline"
          >
            <BookOpen size={12} aria-hidden="true" />
            更多詞彙
          </Link>
        </span>
      )}
    </span>
  );
}

/** 將整段文字內出現嘅詞彙包成 GlossaryTerm */
export function GlossaryText({
  text,
  interactive = true,
  className,
}: {
  text: string;
  interactive?: boolean;
  className?: string;
}) {
  const parts = splitByGlossary(text);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <span key={`t-${i}`}>{part.value}</span>
        ) : (
          <GlossaryTerm
            key={`${part.entry.id}-${i}`}
            entry={part.entry}
            interactive={interactive}
          >
            {part.value}
          </GlossaryTerm>
        ),
      )}
    </span>
  );
}

/** 「更多詞彙」入口 → /guides */
export function GlossaryMoreLink({ className }: { className?: string }) {
  return (
    <Link
      to={GLOSSARY_MORE_HREF}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 text-base font-bold text-red transition-colors hover:text-red-deep hover:underline",
        className,
      )}
    >
      <BookOpen size={14} aria-hidden="true" />
      更多詞彙
    </Link>
  );
}
