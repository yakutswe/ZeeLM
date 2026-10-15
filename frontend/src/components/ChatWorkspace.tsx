"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { StudioHome } from "./StudioHome";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { askZeeLM } from "@/lib/chat-api";
import { loadConversations, saveConversations, newConversation, conversationTimestamp, type Conversation, type ChatMessage } from "@/lib/conversations";
import type { WorkspaceId } from "@/lib/studio-data";

export function ChatWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceId>("assistant");
  const [draft, setDraft] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingRef = useRef<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = conversations.find(c => c.id === activeId);
  const messages = active?.messages ?? [];
  const busy = pendingId !== null;

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setConversations(loadConversations());
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => { if (hydrated) saveConversations(conversations); }, [conversations, hydrated]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length, activeId, busy]);

  function chooseActive(id: string | null) {
    activeIdRef.current = id;
    setActiveId(id);
  }
  function focusComposer() { setFocusSignal(n => n + 1); }
  function startNew() {
    if (!hydrated) return;
    // Empty conversations remain unsaved until the first message is sent.
    chooseActive(null);
    setWorkspace("assistant");
    setDraft("");
    setError("");
    setMenuOpen(false);
    focusComposer();
  }
  function changeWorkspace(id: WorkspaceId) {
    
    setWorkspace(id);
    chooseActive(null);
    setDraft("");
    setError("");
    setMenuOpen(false);
    if (id !== "models") focusComposer();
  }
  function selectConversation(id: string) {
    
    const chat = conversations.find(c => c.id === id);
    if (!chat) return;
    setWorkspace(chat.workspace);
    chooseActive(id);
    setDraft("");
    setError("");
    setMenuOpen(false);
    focusComposer();
  }
  function renameConversation(id: string, title: string) {
    const cleaned = title.trim().slice(0, 100);
    if (!cleaned || id === pendingRef.current) return;
    const updatedAt = conversationTimestamp();
    setConversations(current => current.map(c => c.id === id ? { ...c, title: cleaned, updatedAt } : c));
  }
  function archiveConversation(id: string) {
    
    if (id === pendingRef.current) return;
    const updatedAt = conversationTimestamp();
    setConversations(current => current.map(c => c.id === id ? { ...c, archived: !c.archived, updatedAt } : c));
    if (activeId === id) { chooseActive(null); focusComposer(); }
  }
  function deleteConversation(id: string) {
    if (id === pendingRef.current) return;
    const deletedAt = conversationTimestamp();
    setConversations(current => current.map(c => c.id === id ? { ...c, deletedAt, updatedAt: deletedAt } : c));
    if (activeIdRef.current === id) { chooseActive(null); focusComposer(); }
  }
  function restoreConversation(id: string) {
    const updatedAt = conversationTimestamp();
    setConversations(current => current.map(c => c.id === id ? { ...c, deletedAt: null, archived: false, updatedAt } : c));
  }
  function deleteForever(id: string) {
    if (id === pendingRef.current) return;
    setConversations(current => current.filter(c => c.id !== id));
    if (activeIdRef.current === id) chooseActive(null);
  }
  async function send() {
    const text = draft.trim();
    if (!text || busy || !hydrated || workspace === "models") return;
    const chat = active ?? newConversation(workspace);
    const id = chat.id;
    const now = conversationTimestamp();
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: now };
    const previousMessages = chat.messages;
    setConversations(current => current.some(c => c.id === id)
      ? current.map(c => c.id === id ? { ...c, title: c.messages.length || c.title !== "New conversation" ? c.title : text.slice(0, 55), updatedAt: now, messages: [...c.messages, user] } : c)
      : [{ ...chat, title: text.slice(0, 55), updatedAt: now, messages: [user] }, ...current]);
    chooseActive(id);
    setDraft("");
    setError("");
    pendingRef.current = id;
    setPendingId(id);
    try {
      const reply = await askZeeLM(text, previousMessages);
      const finishedAt = conversationTimestamp();
      const assistant: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: reply, createdAt: finishedAt };
      setConversations(current => current.map(c => c.id === id ? { ...c, updatedAt: finishedAt, messages: [...c.messages, assistant] } : c));
    } catch (failure) {
      if (activeIdRef.current === id) {
        setError(failure instanceof Error ? failure.message : "Unable to reach ZeeLM. Please retry.");
        setDraft(text);
      }
    } finally {
      pendingRef.current = null;
      setPendingId(null);
      if (activeIdRef.current === id) focusComposer();
    }
  }

  return <div className="app-shell">
    <Sidebar open={menuOpen} workspace={workspace} activeId={activeId} conversations={conversations} busy={busy} onClose={() => setMenuOpen(false)} onWorkspace={changeWorkspace} onNew={startNew} onSelect={selectConversation} onRename={renameConversation} onArchive={archiveConversation} onDelete={deleteConversation} onRestore={restoreConversation} onDeleteForever={deleteForever} pendingId={pendingId} />
    <main className="workspace">
      <WorkspaceHeader workspace={workspace} onMenu={() => setMenuOpen(true)} />
      <div className="workspace-body" ref={scrollRef}>
        {messages.length === 0 ? <StudioHome workspace={workspace} onPrompt={value => { setDraft(value); focusComposer(); }} onWorkspace={changeWorkspace} /> :
          <section className="conversation" aria-label="Current conversation">
            <div className="conversation-heading"><span>{active?.title ?? "CONVERSATION"}</span><span>{messages.length} MESSAGES · QWEN3</span></div>
            {messages.map(message => <MessageBubble key={message.id} message={message} />)}
            {pendingId === activeId && <div className="thinking" role="status"><span className="thinking-dots" /> ZeeLM is generating your answer...</div>}
          </section>}
      </div>
      {workspace !== "models" && <Composer draft={draft} onDraft={setDraft} onSend={() => void send()} busy={busy} error={error} focusSignal={focusSignal} />}
    </main>
  </div>;
}
