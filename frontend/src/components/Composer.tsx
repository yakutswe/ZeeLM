"use client";
import { useEffect, useRef } from "react";

type Props = { draft: string; onDraft: (value: string) => void; onSend: () => void; busy: boolean; error: string; focusSignal?: number };
export function Composer({ draft, onDraft, onSend, busy, error, focusSignal = 0 }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (focusSignal > 0) ref.current?.focus({ preventScroll: true }); }, [focusSignal]);
  return <div className="composer-dock"><div className="composer-inner">
    {error && <div className="chat-error" role="alert">{error}</div>}
    <form className="composer" onSubmit={event => { event.preventDefault(); onSend(); }}>
      <label className="sr-only" htmlFor="zeelm-prompt">Message ZeeLM</label>
      <textarea ref={ref} id="zeelm-prompt" rows={2} value={draft} onChange={event => onDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Ask ZeeLM anything..." />
      <div className="composer-toolbar"><span>Enter to send · Shift + Enter for a new line</span><div className="composer-actions"><span className="composer-model">Qwen3 · Local</span><button className="send-button" type="submit" disabled={busy || !draft.trim()} aria-label="Send message">{busy ? "..." : "↑"}</button></div></div>
    </form><div className="composer-footnote"><span>ZeeLM runs locally. Verify important outputs.</span><span>INTELLIGENCE STUDIO</span></div>
  </div></div>;
}
