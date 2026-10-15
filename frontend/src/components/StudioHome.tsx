"use client";

import { studioContent, type WorkspaceId } from "@/lib/studio-data";

type Props = {
  workspace: WorkspaceId;
  onPrompt: (value: string) => void;
  onWorkspace: (id: WorkspaceId) => void;
};

export function StudioHome({ workspace, onPrompt, onWorkspace }: Props) {
  if (workspace === "models") {
    return (
      <section className="home" aria-label="Model Lab home">
        <div className="home-intro">
          <p className="eyebrow">MODEL LAB / LOCAL EXPERIMENTS</p>
          <h1>Measure what <em>improves.</em></h1>
          <p className="home-subtitle">Track our ZeeLM research separately from the Qwen assistant currently powering chat.</p>
        </div>
        <div className="section-kicker"><span>LOCAL RESEARCH</span><span>V4.1</span></div>
        <div className="model-lab-card">
          <div>
            <h2>ZeeLM V4.1</h2>
            <p>Character-level language model checkpoint. Best reported validation loss: 2.5990 at step 1500. This model is experimental and is not the active conversational assistant.</p>
          </div>
          <div className="metric"><strong>V4.1</strong><span>EXPERIMENTAL</span></div>
        </div>
        <p className="home-note">Evaluation dashboards and experimental model serving are planned; neither is connected here yet.</p>
      </section>
    );
  }

  const content = studioContent[workspace];
  return (
    <section className="home" aria-label={`${workspace} workspace home`}>
      <div className="home-intro">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.lead} <em>{content.accent}</em></h1>
        <p className="home-subtitle">{content.subtitle}</p>
      </div>
      <div className="section-kicker"><span>{content.kicker}</span><span>01 — 03</span></div>
      <div className="studio-grid">
        {content.cards.map((card) => (
          <button
            type="button"
            key={`${workspace}-${card.tag}`}
            className="studio-card"
            onClick={() => {
              if (card.destination && card.destination !== workspace) onWorkspace(card.destination);
              onPrompt(card.prompt);
            }}
          >
            <div className="card-top"><span>{card.tag}</span><span aria-hidden="true">↗</span></div>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
            <span className="card-line" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="home-foot"><span className="status-dot" /> Powered by your local Qwen model <span>·</span> Your workspace, your pace</div>
    </section>
  );
}
