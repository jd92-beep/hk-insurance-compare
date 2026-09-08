import { useId, useRef, useState, useSyncExternalStore } from "react";
import { Bookmark, ArrowUpRight, Trash2, ChevronDown } from "lucide-react";
import type { Product } from "@/types/insurance";
import { createSavedStore, makeSavedSet, reviewSavedSet, SAVED_COMPARISONS_KEY, SAVED_COMPARISONS_LIMIT } from "@/lib/saved-comparisons";

/** Optional workspace tool, not another mandatory category questionnaire. */
export default function SavedComparisons({selected,catalog,snapshotDate,onRestore}: {
  selected:Product[];catalog:Product[];snapshotDate:string;onRestore:(ids:string[])=>void;
}) {
  const inputId=useId();const inputRef=useRef<HTMLInputElement>(null);
  const [name,setName]=useState("");const [notice,setNotice]=useState("");const [deleting,setDeleting]=useState<string|null>(null);
  const [store]=useState(()=>createSavedStore({
    read:()=>typeof window==="undefined"?null:localStorage.getItem(SAVED_COMPARISONS_KEY),
    write:raw=>localStorage.setItem(SAVED_COMPARISONS_KEY,raw),
    listen:changed=>{
      if(typeof window==="undefined")return()=>{};
      const handler=(event:StorageEvent)=>{
        if(event.key!==SAVED_COMPARISONS_KEY&&event.key!==null)return;
        try {if(event.storageArea&&event.storageArea!==window.localStorage)return;}catch{return;}
        changed();
      };
      window.addEventListener("storage",handler);return()=>window.removeEventListener("storage",handler);
    },
  }));
  const state=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
  const save=()=>{
    setNotice("");
    try {
      const set=makeSavedSet({id:crypto.randomUUID(),name,products:selected,snapshotDate,now:new Date().toISOString()});
      if(store.save(set)){setName("");setNotice(`已收藏「${set.name}」；只保存在此瀏覽器。`);}
    } catch {setNotice("未能建立收藏；請輸入1–60字名稱，並選擇1–3款不同產品。");}
  };
  return <details className="group mb-8 min-w-0 rounded-2xl border border-jade/20 bg-paper" data-saved-comparisons>
    <summary className="flex min-h-14 cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-jade">
      <span className="inline-flex items-center gap-2 font-semibold text-ink"><Bookmark size={18} className="text-jade" aria-hidden="true" />收藏比較組合</span>
      <span className="inline-flex items-center gap-2 text-xs text-ink-soft">{state.sets.length} / {SAVED_COMPARISONS_LIMIT} 組 · 此瀏覽器專用<ChevronDown size={16} className="group-open:rotate-180" aria-hidden="true" /></span>
    </summary>
    <div className="border-t border-line p-4 md:p-6">
      <p className="max-w-3xl text-sm leading-relaxed text-ink-soft">保留產品選擇，方便下次再比較。重新開啟會使用當前網站資料，唔係保存報價或鎖定保費。收藏只保存產品識別、名稱及資料指紋；請勿在名稱填入個人或健康資料。</p>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={event=>{event.preventDefault();save();}}>
        <div className="min-w-0 flex-1 basis-64"><label className="mb-2 block text-sm font-semibold" htmlFor={inputId}>組合名稱</label><input ref={inputRef} id={inputId} value={name} onChange={event=>setName(event.target.value)} maxLength={60} required placeholder="例如：十月旅遊候選" className="min-h-11 w-full rounded-xl border bg-paper px-3 text-base focus:outline-2 focus:outline-jade" /></div>
        <button type="submit" disabled={selected.length===0||state.sets.length>=SAVED_COMPARISONS_LIMIT} className="btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-40">儲存目前 {selected.length} 款</button>
      </form>
      {selected.length===0&&<p className="mt-2 text-sm text-ink-soft">先加入產品，或從下方重新開啟已收藏組合。</p>}
      {state.issue&&<div role="alert" className="mt-4 rounded-xl bg-amber/10 p-3 text-sm">{state.issue}<button type="button" className="ml-2 min-h-11 text-jade underline" onClick={()=>{setNotice("");store.refresh();}}>重新讀取收藏</button></div>}
      <p role="status" aria-live="polite" className="mt-3 text-sm text-jade">{notice}</p>
      {!state.sets.length&&!state.issue&&<p className="py-4 text-sm text-ink-soft">未有收藏。儲存後可在同一瀏覽器重開，清除瀏覽器資料會移除收藏。</p>}
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {state.sets.map(set=>{
          const review=reviewSavedSet(set,catalog);
          return <li key={set.id} className="min-w-0 rounded-xl border border-line bg-paper-2/40 p-4" data-saved-set>
            <h3 className="break-words font-semibold text-ink">{set.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">收藏於 {new Date(set.createdAt).toLocaleString("zh-HK")} · 當時資料快照：{set.snapshotDate}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">{set.products.map(p=><li key={p.id} className="break-words">{p.name}</li>)}</ul>
            {!!review.changed.length&&<p className="mt-3 rounded-lg bg-amber/10 p-3 text-sm">{review.changed.length} 款網站資料或來源指紋已變動；重新開啟後請覆核，唔代表保險公司已更改保单。</p>}
            {!!review.missing.length&&<p className="mt-3 rounded-lg bg-amber/10 p-3 text-sm">目前缺少 {review.missing.map(p=>p.name).join("、")} 的資料；未有以其他產品代替。</p>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button type="button" className="btn-ghost min-h-11 text-sm disabled:opacity-40" disabled={!review.availableIds.length} onClick={()=>{onRestore(review.availableIds);setNotice(`已要求載入「${set.name}」的當前產品資料。`);}}>
                {review.missing.length?`載入仍有資料的 ${review.availableIds.length} 款`:"重新開啟比較"}<ArrowUpRight size={15} aria-hidden="true" />
              </button>
              {deleting===set.id?<span className="flex flex-wrap gap-2"><button type="button" className="min-h-11 px-2 text-sm font-semibold text-red" aria-label={`確認刪除 ${set.name}`} onClick={()=>{if(store.remove(set.id)){setDeleting(null);inputRef.current?.focus();setNotice(`已刪除「${set.name}」收藏；目前比較不受影響。`);}}}>確認刪除</button><button type="button" className="min-h-11 px-2 text-sm underline" onClick={()=>setDeleting(null)}>取消</button></span>:<button type="button" className="inline-flex min-h-11 items-center gap-1 px-2 text-sm text-ink-soft hover:text-red" aria-label={`刪除收藏 ${set.name}`} onClick={()=>setDeleting(set.id)}><Trash2 size={15} aria-hidden="true" />刪除</button>}
            </div>
          </li>;
        })}
      </ul>
    </div>
  </details>;
}
