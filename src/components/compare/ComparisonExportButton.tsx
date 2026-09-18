import {useEffect,useRef,useState} from "react";
import {Download} from "lucide-react";
import type {Product} from "@/types/insurance";
import {comparisonBrief} from "@/lib/comparison-export";
import {FULL_VERSION_STRING} from "@/lib/version";

export default function ComparisonExportButton({products,snapshotDate}:{products:Product[];snapshotDate:string}) {
  const [notice,setNotice]=useState("");const [error,setError]=useState("");
  const urls=useRef(new Set<string>());const timers=useRef(new Set<number>());
  useEffect(()=>{const liveUrls=urls.current,liveTimers=timers.current;return()=>{liveTimers.forEach(id=>window.clearTimeout(id));liveUrls.forEach(url=>URL.revokeObjectURL(url));};},[]);
  const download=()=>{
    setNotice("");setError("");let url:string|undefined;let anchor:HTMLAnchorElement|undefined;
    try {
      const brief=comparisonBrief(products,{origin:window.location.origin,snapshotDate,exportedAt:new Date().toISOString(),version:FULL_VERSION_STRING});
      url=URL.createObjectURL(new Blob([brief.content],{type:"text/markdown;charset=utf-8"}));urls.current.add(url);
      anchor=document.createElement("a");anchor.href=url;anchor.download=brief.filename;anchor.hidden=true;
      document.body.appendChild(anchor);anchor.click();
      const current=url;const timer=window.setTimeout(()=>{URL.revokeObjectURL(current);urls.current.delete(current);timers.current.delete(timer);},1000);timers.current.add(timer);
      setNotice("已產生核對摘要並交予瀏覽器下載；請查看下載項目。");
    } catch {
      if(url){URL.revokeObjectURL(url);urls.current.delete(url);}
      setError("未能匯出核對摘要。請重試；未有回報檔案已儲存。");
    } finally {anchor?.remove();}
  };
  return <div className="min-w-0">
    <button type="button" onClick={download} disabled={!products.length} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-jade/30 px-4 text-small font-bold text-jade transition-colors hover:bg-jade/5 disabled:opacity-40" title="下載包含網站摘要及來源連結的 Markdown 檔案，並非保單原文">
      <Download size={15} aria-hidden="true" />匯出核對摘要
    </button>
    <span role="status" aria-live="polite" className="sr-only">{notice}</span>
    {error&&<p role="alert" className="mt-2 max-w-xs text-xs text-red">{error}</p>}
  </div>;
}
