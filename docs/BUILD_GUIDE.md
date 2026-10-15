# ZeeLM — detailed implementation and reproduction guide

[← README](../README.md) · [Commands](COMMAND_REFERENCE.md) · [Publish](GITHUB_PUBLISH.md)

## Scope and provenance

This guide documents the **verified architecture and major development stages** supported by the supplied authored-source release, follow-up recovery/sidebar code, terminal transcripts and screenshots. It is **not** a claim to reproduce every unsaved intermediate terminal command from the project's full history. Git commit history, when maintained, is the reproducible record of individual code changes. The source files in the repository—not snippets here—are the complete final code.

## Stage 0 — Inventory and protect the existing project

The project was developed in Windows under `C:\Users\yakut\zeelm`. From VS Code → Terminal → New Terminal, run:

```powershell
Set-Location 'C:\Users\yakut\zeelm'
Get-ChildItem -Force
Get-ChildItem .\frontend\src\components
Get-ChildItem .\frontend\src\app
Get-ChildItem .\backend\app
```

Create a private source backup **outside the tracked repo** before replacing any working files:

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $HOME "ZeeLM-private-backup-$stamp"
New-Item -ItemType Directory -Path $backup | Out-Null
Copy-Item .\frontend\src (Join-Path $backup 'frontend-src') -Recurse
Copy-Item .\backend (Join-Path $backup 'backend') -Recurse
```

Keep backups, training weights, cached builds and browser exports out of Git. Never overwrite working code from an older release archive without reviewing the difference.

## Stage 1 — Development tools

```powershell
node --version
npm --version
py --version
git --version
ollama --version
```

Install and configure Node.js, Python, Git, VS Code and Ollama using their official documentation. The project has been built with Next.js 16.4.0 in the supplied terminal logs; verify `frontend/package.json` before choosing exact versions.

## Stage 2 — Backend and local model

Files:

- `backend/app/main.py` — FastAPI application, `HistoryEntry` and `ChatRequest` models, `/`, `/health`, `/chat` endpoints, Ollama `AsyncClient` integration.
- `backend/app/__init__.py` — Python package marker.
- `backend/requirements-zeelm.txt` or `backend/requirements.txt` — actual dependencies in your checkout.

```powershell
Set-Location 'C:\Users\yakut\zeelm'
py -m venv .venv                          # Skip if .venv already exists
.\.venv\Scripts\python.exe -m pip install -r .\backend\requirements-zeelm.txt
ollama pull qwen3:1.7b
ollama list
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

If requirements filename differs, replace only that path. If the backend imports a different Python package path in your actual checkout, use that path instead of `backend.app.main:app`. Open `/health` and `/docs` to verify.

## Stage 3 — Frontend and project structure

Files and their functional roles:

- `frontend/src/app/layout.tsx` imports `./globals.css` and defines Next.js root layout.
- `frontend/src/app/page.tsx` renders the studio shell.
- `frontend/src/app/api/chat/route.ts` forwards requests to FastAPI.
- `frontend/src/components/BrandMark.tsx` — ZeeLM brand.
- `frontend/src/components/BackgroundVideo.tsx` — presentation of the supplied static Blue Illumination asset (despite its component name).
- `frontend/src/components/WorkspaceHeader.tsx` — active workspace title and model status.
- `frontend/src/components/Sidebar.tsx` — workspace links and conversation actions.
- `frontend/src/components/ChatWorkspace.tsx` — chat and conversation lifecycle.
- `frontend/src/components/StudioHome.tsx` — startup experience.
- `frontend/src/components/Composer.tsx` — text composer and send controls.
- `frontend/src/components/MessageBubble.tsx` — Markdown message display.
- `frontend/src/lib/chat-api.ts` — `POST /api/chat` browser client.
- `frontend/src/lib/studio-data.ts` — workspace identifiers and metadata.
- `frontend/src/lib/conversations.ts` — browser persistence helpers and history types.
- `frontend/src/app/globals.css` — styling and media queries.
- `frontend/public/images/blue-illumination.webp` — local visual asset.

Run from a separate terminal:

```powershell
Set-Location 'C:\Users\yakut\zeelm\frontend'
npm ci
npm run dev
```

Use `npm install` if `package-lock.json` is missing. Watch for the printed actual port; Next.js may fall back to 3001 when port 3000 is busy.

## Stage 4 — Local inference request flow

1. The user submits text from `Composer.tsx`.
2. `ChatWorkspace.tsx` collects the latest eligible conversation turns.
3. `chat-api.ts` sends the message to Next.js `/api/chat`.
4. The Next.js route proxies it to FastAPI `/chat`.
5. FastAPI formats system, history and user messages, then invokes Ollama `qwen3:1.7b`.
6. The reply returns through FastAPI and Next.js to the UI.
7. The conversation state is persisted to browser storage when the app saves changes.

Consult [ARCHITECTURE.md](ARCHITECTURE.md) for the request/response structures. Do not commit local chat data.

## Stage 5 — Workspaces and conversation lifecycle

Workspace names: AI Assistant, Product Studio, Engineering Lab, Research Desk, Model Lab.

The 2.6 recovery change introduced the Recently Deleted category alongside Recent and Archived, keeping existing browser storage compatibility. Soft-deleted chats have a recovery period of 30 days; cleanup runs on load/save, and permanent deletion requires confirmation. The recent sidebar rebuild used three independent section containers with `zeelm-history-sections`, `zeelm-history-section`, and `zeelm-history-list` classes to separate section spacing from conversation-row spacing.

### Sidebar debugging lesson

**Symptom:** Three accordion-like cards appeared to touch even after changing CSS.

**Observed diagnosis:** DevTools returned `{display:'block', gap:'normal'}` for the old `.sidebar .conversation-links` node. Temporary DOM styles changed the layout, but DevTools changes did not survive refresh. Multiple app servers (3000 vs 3001), duplicate styles and older JSX copies also made iteration confusing.

**Correction used in later source:** Reorganize the sections into independent wrappers and a dedicated grid with 16px `rowGap`, rather than accumulating `!important` overrides against `.conversation-links`. Inspect the committed `Sidebar.tsx` and `globals.css` to see the actual version being published.

**Important:** The screenshots alone do not prove which precise CSS-loading or server process issue caused every failed attempt; do not present an unverified single root cause as fact.

## Stage 6 — Validation and manual QA

```powershell
Set-Location 'C:\Users\yakut\zeelm\frontend'
npx --no-install tsc --noEmit
npx --no-install next build
```

Perform these manually in your running app:

- [ ] The Blue Illumination background is visible without an unintended grid overlay.
- [ ] All five workspaces navigate without losing the active conversation.
- [ ] The Recent, Archived and Recently Deleted cards have visible spacing after a hard refresh.
- [ ] A new conversation opens a blank composer without creating empty history.
- [ ] Sending a message returns a Qwen response; Markdown is legible.
- [ ] Rename, archive/unarchive, soft delete, restore and permanent delete behave correctly.
- [ ] Reloading preserves browser-local history.
- [ ] A mobile-sized viewport exposes a usable sidebar and composer.
- [ ] Browser and terminal consoles have no new uncaught errors.
- [ ] The local API responds through both `/health` and `/chat`.

Record the output and test dates in your own commit/PR. Do not claim tests passed unless run on the current working tree.

## Stage 7 — Repository readiness

1. Copy README and `docs/` into the local project root.
2. Add `.gitignore` and inspect it carefully against your current assets.
3. Keep source assets, API definitions, and build tooling, including `frontend/package.json`, `package-lock.json`, and Python dependency manifests.
4. Never include `.venv`, `node_modules`, `.next`, `.env`, browser data, private backups, training datasets or model checkpoints.
5. Run builds and smoke tests.
6. Follow [GITHUB_PUBLISH.md](GITHUB_PUBLISH.md).

## Where the exact full source lives

Every code file is published **as code in the repository**. This guide describes their design, workflow and terminal commands; it intentionally does not duplicate hundreds of lines of code that can drift out of sync with the real source. For a reproducible snapshot, create a version tag after verification and record it in GitHub Releases.
