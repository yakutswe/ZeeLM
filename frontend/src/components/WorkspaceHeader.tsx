"use client";
import type { WorkspaceId } from "@/lib/studio-data";
import { workspaces } from "@/lib/studio-data";
export function WorkspaceHeader({workspace,onMenu}:{workspace:WorkspaceId;onMenu:()=>void}) {
 const name=workspaces.find(w=>w.id===workspace)?.label ?? "AI Assistant";
 return <header className="workspace-header"><div className="header-left"><button type="button" className="menu-trigger" aria-label="Open sidebar" onClick={onMenu}>☰</button><div><div className="eyebrow">ZEELM / WORKSPACE</div><div className="header-title">{name}<span className="header-crumb"> / Studio</span></div></div></div><div className="header-right"><span className="header-caption">LOCAL-FIRST INTELLIGENCE</span><span className="model-badge"><i className="status-dot"/> Qwen3 · 1.7B</span></div></header>;
}
