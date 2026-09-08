import type { Product } from "../types/insurance";
import { evidenceEntries } from "./pdf-evidence.ts";

export const SAVED_COMPARISONS_KEY = "ic-saved-comparisons-v1";
export const SAVED_COMPARISONS_LIMIT = 10;
interface SavedProduct { id: string; name: string; revision: string }
export interface SavedSet { id: string; name: string; createdAt: string; snapshotDate: string; products: SavedProduct[] }
export interface SavedState { sets: SavedSet[]; issue: string | null }
interface StoragePort { read: () => string | null; write: (raw: string) => void; listen: (changed: () => void) => () => void }
const EMPTY: SavedState = {sets:[],issue:null};
const object = (v: unknown): v is Record<string,unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const validId = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(v);
const text = (v: unknown, max: number): v is string => typeof v === "string" && !!v.trim() && v.length <= max && !Array.from(v).some(ch=>ch.charCodeAt(0)<32||ch.charCodeAt(0)===127);
const nameKey = (value: string) => value.trim().normalize("NFKC").toLowerCase();
const timestamp = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;

/** Change detection, not a signature, a policy version or a guaranteed price. */
export function productRevision(p: Product): string {
  const input = JSON.stringify(["saved-comparison-v1",p.id,p.category,p.insurer,p.insurer_zh,p.product_name,p.product_name_zh,
    p.plan_tiers,p.premium_range,p.premium_notes,p.premium_available,p.original_price,p.discounted_price,p.official_buy_url,
    p.promo,p.trip_type,p.destination_scope,p.key_terms,p.exclusions,p.coverage.map(c=>[c.item,c.limit,c.source_url,c.page,c.quote,c.document_name]),
    evidenceEntries(p).map(e=>e.fingerprint)]);
  let hash=14695981039346656037n;
  for(const ch of input) hash=BigInt.asUintN(64,(hash^BigInt(ch.codePointAt(0)!))*1099511628211n);
  return hash.toString(16).padStart(16,"0");
}
function validateSet(value: unknown): SavedSet {
  if(!object(value)||!validId(value.id)||!text(value.name,60)||!timestamp(value.createdAt)||!text(value.snapshotDate,40)||!Array.isArray(value.products)||value.products.length<1||value.products.length>3) throw Error("收藏資料格式不正確。");
  const products: SavedProduct[]=value.products.map(p=>{
    if(!object(p)||!validId(p.id)||!text(p.name,300)||typeof p.revision!=="string"||!/^[a-f0-9]{16}$/.test(p.revision)) throw Error("收藏產品資料格式不正確。");
    return {id:p.id,name:p.name,revision:p.revision};
  });
  if(new Set(products.map(p=>p.id)).size!==products.length) throw Error("收藏產品不可重複。");
  return {id:value.id,name:value.name.trim(),createdAt:value.createdAt,snapshotDate:value.snapshotDate,products};
}
export function readSavedSets(raw: string | null): SavedState {
  if(raw===null) return EMPTY;
  try {
    if(raw.length>100000) throw Error();
    const value:unknown=JSON.parse(raw);
    if(!object(value)||value.version!==1||!Array.isArray(value.sets)||value.sets.length>SAVED_COMPARISONS_LIMIT) throw Error();
    const sets=value.sets.map(validateSet);
    if(new Set(sets.map(s=>s.id)).size!==sets.length||new Set(sets.map(s=>nameKey(s.name))).size!==sets.length) throw Error();
    return {sets,issue:null};
  } catch {return {sets:[],issue:"收藏格式損壞或來自未支援版本；未有覆寫既有資料。"};}
}
export function makeSavedSet({id,name,products,snapshotDate,now}: {id:string;name:string;products:Product[];snapshotDate:string;now:string}): SavedSet {
  return validateSet({id,name,createdAt:now,snapshotDate,products:products.map(p=>({id:p.id,name:p.product_name_zh||p.product_name,revision:productRevision(p)}))});
}
export function reviewSavedSet(set: SavedSet, products: Product[]) {
  const current=new Map(products.map(p=>[p.id,p]));
  return {
    availableIds:set.products.filter(p=>current.has(p.id)).map(p=>p.id),
    missing:set.products.filter(p=>!current.has(p.id)),
    changed:set.products.filter(p=>current.has(p.id)&&productRevision(current.get(p.id)!)!==p.revision),
  };
}

/** Read-before-write lowers stale-tab overwrites; truly simultaneous writes are last-writer-wins. */
export function createSavedStore(port: StoragePort) {
  let state=EMPTY; let disconnect:(()=>void)|undefined;
  const subscribers=new Set<()=>void>();
  const publish=(next:SavedState)=>{
    if(JSON.stringify(next)===JSON.stringify(state))return;
    state=next;subscribers.forEach(fn=>fn());
  };
  const refresh=()=>{
    try {publish(readSavedSets(port.read()));}
    catch {publish({...state,issue:"瀏覽器未允許讀取收藏；目前比較仍可使用。"});}
  };
  const mutate=(change:(sets:SavedSet[])=>SavedSet[])=>{
    try {
      const latest=readSavedSets(port.read());
      if(latest.issue){publish(latest);return false;}
      const sets=change(latest.sets);
      const raw=JSON.stringify({version:1,sets});
      const checked=readSavedSets(raw);
      if(checked.issue)throw Error(checked.issue);
      port.write(raw);publish(checked);return true;
    } catch(error){publish({...state,issue:error instanceof Error&&/收藏/.test(error.message)?error.message:"未能保存收藏（可能權限或空間不足）；未有回報成功。"});return false;}
  };
  refresh();
  return {
    getSnapshot:()=>state,getServerSnapshot:()=>EMPTY,refresh,
    subscribe:(fn:()=>void)=>{
      subscribers.add(fn);
      if(subscribers.size===1){disconnect=port.listen(refresh);refresh();}
      return()=>{subscribers.delete(fn);if(!subscribers.size){disconnect?.();disconnect=undefined;}};
    },
    save:(set:SavedSet)=>mutate(sets=>{
      const checked=validateSet(set);
      if(sets.some(s=>s.id===checked.id||nameKey(s.name)===nameKey(checked.name)))throw Error("收藏名稱已存在，請用另一個名稱。" );
      if(sets.length>=SAVED_COMPARISONS_LIMIT)throw Error("最多保存10組收藏；請先刪除不需要的組合。" );
      return [checked,...sets];
    }),
    remove:(id:string)=>mutate(sets=>sets.filter(set=>set.id!==id)),
  };
}
