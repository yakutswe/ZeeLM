"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BrandMark } from "./BrandMark";
import type { Conversation } from "@/lib/conversations";
import { workspaces, type WorkspaceId } from "@/lib/studio-data";

type Props = {
  open: boolean;
  workspace: WorkspaceId;
  activeId: string | null;
  conversations: Conversation[];
  busy: boolean;
  onClose: () => void;
  onWorkspace: (id: WorkspaceId) => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
  pendingId: string | null;
};

type MenuState = { id: string; top: number; left: number } | null;

type SidebarSectionCardProps = {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
};

function SidebarSectionCard({ label, count, open, onToggle }: SidebarSectionCardProps) {
  return (
    <button type="button" className={`sidebar-section-card ${open ? "is-open" : ""}`} onClick={onToggle} aria-expanded={open}>
      <span className="sidebar-section-card__left">
        <span className="sidebar-section-card__chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
        <span className="sidebar-section-card__label">{label}</span>
      </span>
      <span className="sidebar-section-card__count">{count}</span>
    </button>
  );
}

export function Sidebar({ open, workspace, activeId, conversations, busy, onClose, onWorkspace, onNew, onSelect, onRename, onArchive, onDelete, onRestore, onDeleteForever, pendingId }: Props) {
  const [menu, setMenu] = useState<MenuState>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showRecent, setShowRecent] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const recent = conversations.filter(c => !c.archived && !c.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt);
  const archived = conversations.filter(c => c.archived && !c.deletedAt).sort((a, b) => b.updatedAt - a.updatedAt);
  const deleted = conversations.filter(c => Boolean(c.deletedAt)).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
  const selected = conversations.find(c => c.id === menu?.id);

  useEffect(() => {
    if (!menu) return;
    function closeOnOutside(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current?.contains(target) && !(target instanceof Element && target.closest(".history-menu-trigger"))) setMenu(null);
    }
    function close() { setMenu(null); }
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") close(); }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("scroll", close, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("scroll", close, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  function toggleMenu(id: string, button: HTMLButtonElement) {
    if (menu?.id === id) { setMenu(null); return; }
    const bounds = button.getBoundingClientRect();
    setMenu({ id, left: Math.max(8, Math.min(bounds.right - 180, window.innerWidth - 188)), top: Math.max(8, Math.min(bounds.bottom + 6, window.innerHeight - 152)) });
  }

  function renderChat(chat: Conversation) {
    return (
      <div className={`history-row ${activeId === chat.id ? "history-row--selected" : ""}`} key={chat.id}>
        {editingId === chat.id ? (
          <form className="history-edit" onSubmit={event => { event.preventDefault(); onRename(chat.id, editingTitle); setEditingId(null); }}>
            <input autoFocus aria-label="Rename conversation" maxLength={100} value={editingTitle} onChange={event => setEditingTitle(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setEditingId(null); }} />
            <button type="submit" aria-label="Save conversation title">✓</button>
          </form>
        ) : (
          <button type="button" className="history-title" title={chat.title} onClick={() => { if (!chat.deletedAt) onSelect(chat.id); }} disabled={Boolean(chat.deletedAt)}>{chat.title}</button>
        )}
        <button type="button" className="history-menu-trigger" aria-label={`Actions for ${chat.title}`} aria-haspopup="menu" aria-expanded={menu?.id === chat.id} onClick={event => toggleMenu(chat.id, event.currentTarget)} disabled={chat.id === pendingId}>•••</button>
      </div>
    );
  }

  return <>
    {open && <button type="button" className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Primary navigation">
      <div className="brand"><BrandMark size={36} /><div><strong>ZeeLM<span>.</span></strong><small>INTELLIGENCE STUDIO</small></div><button type="button" className="mobile-close" onClick={onClose} aria-label="Close menu">×</button></div>
      <button type="button" className="new-chat" onClick={() => { setMenu(null); onNew(); }}><span>＋</span> New conversation <span aria-hidden="true">↗</span></button>
      <div className="side-label">WORKSPACES</div>
      <nav className="workspace-nav" aria-label="Workspaces">
        {workspaces.map(item => <button key={item.id} type="button" onClick={() => { setMenu(null); onWorkspace(item.id); }} className={`nav-link ${workspace === item.id ? "nav-link--active" : ""}`} aria-current={workspace === item.id ? "page" : undefined}><span className="nav-symbol">{item.symbol}</span><span>{item.label}</span></button>)}
      </nav>
      {/* Independent history sections: spacing is controlled by this grid. */}
      <div
        className="zeelm-history-sections"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          rowGap: "16px",
          marginTop: "20px",
          width: "100%",
          minWidth: 0,
        }}
      >
        <section className="zeelm-history-section" aria-label="Recent conversations">
          <SidebarSectionCard
            label="Recent Conversations"
            count={recent.length}
            open={showRecent}
            onToggle={() => setShowRecent(value => !value)}
          />
          {showRecent && (
            <div className="zeelm-history-list">
              {recent.length ? recent.map(renderChat) : (
                <p className="side-empty">Your conversations appear after your first message.</p>
              )}
            </div>
          )}
        </section>

        <section className="zeelm-history-section" aria-label="Archived conversations">
          <SidebarSectionCard
            label="Archived"
            count={archived.length}
            open={showArchived}
            onToggle={() => setShowArchived(value => !value)}
          />
          {showArchived && (
            <div className="zeelm-history-list">
              {archived.length ? archived.map(renderChat) : (
                <p className="side-empty">No archived conversations.</p>
              )}
            </div>
          )}
        </section>

        <section className="zeelm-history-section" aria-label="Recently deleted conversations">
          <SidebarSectionCard
            label="Recently Deleted"
            count={deleted.length}
            open={showDeleted}
            onToggle={() => setShowDeleted(value => !value)}
          />
          {showDeleted && (
            <div className="zeelm-history-list">
              <p className="side-empty">
                {deleted.length ? "Restore within 30 days." : "No recently deleted conversations."}
              </p>
              {deleted.map(renderChat)}
            </div>
          )}
        </section>
      </div>
      <div className="sidebar-footer"><div className="connection"><span className="status-dot" /> LOCAL MODEL <strong>Qwen3 1.7B</strong></div><p>ZeeLM V4.1 · Experimental model<br />Chat data stays in this browser.</p></div>
    </aside>
    {menu && selected && createPortal(<div ref={menuRef} className="zeelm-floating-menu" role="menu" aria-label={`Manage ${selected.title}`} style={{ top: menu.top, left: menu.left }}>
      {selected.deletedAt ? <>
        <button role="menuitem" type="button" onClick={() => { onRestore(selected.id); setMenu(null); }}>Restore to Recent</button>
        <button role="menuitem" type="button" className="danger" onClick={() => { if (window.confirm(`Permanently delete "${selected.title}"? This cannot be undone.`)) onDeleteForever(selected.id); setMenu(null); }}>Delete Permanently</button>
      </> : <>
        <button role="menuitem" type="button" onClick={() => { setEditingId(selected.id); setEditingTitle(selected.title); setMenu(null); }}>Rename</button>
        <button role="menuitem" type="button" onClick={() => { onArchive(selected.id); setMenu(null); }}>{selected.archived ? "Unarchive" : "Archive"}</button>
        <button role="menuitem" type="button" className="danger" onClick={() => { onDelete(selected.id); setMenu(null); }}>Move to Recently Deleted</button>
      </>}
    </div>, document.body)}
  </>;
}
