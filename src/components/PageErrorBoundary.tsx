import { Component } from "react";
import type { ReactNode } from "react";
export default class PageErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(this.state.failed)return <section role="alert" className="site-container py-20"><h1 className="font-serif text-3xl font-bold">頁面暫時未能開啟</h1><p className="my-5 text-ink-soft">可能係網絡或版本載入問題。請重新整理；唔會改動你嘅保單或外部帳戶。</p><button className="btn-primary min-h-11" onClick={()=>window.location.reload()}>重新整理頁面</button></section>;
    return this.props.children;
  }
}
