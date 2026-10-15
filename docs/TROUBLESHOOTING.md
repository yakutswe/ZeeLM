# ZeeLM · Troubleshooting

Practical checks for developers running ZeeLM locally. These notes are intentionally separate from the portfolio-facing README.

## Next.js starts on port 3001 instead of 3000

A different process may already be using port 3000. Follow the URL shown by the active `npm run dev` terminal, or stop the extra development server.

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
```

Check the owning process before stopping it. Do not terminate a process you haven't identified.

## Styling changes appear in Chrome but disappear on refresh

JavaScript style changes made in Chrome DevTools Console are temporary. Update the project's React component or imported CSS instead. The runtime stylesheet import lives in `frontend/src/app/layout.tsx`. Confirm the browser is using the expected Next.js server/port and refresh after saving.

Use Chrome Console to inspect the rendered layout:

```javascript
const el = document.querySelector('.sidebar .conversation-links');
console.log(el ? { display: getComputedStyle(el).display, gap: getComputedStyle(el).gap } : 'Container not found');
```

If the component was refactored, inspect the relevant new sidebar class instead.

## FastAPI or Ollama cannot be reached

Confirm that Ollama is running, the model is installed, and FastAPI is responding:

```powershell
ollama list
Invoke-RestMethod http://127.0.0.1:8000/health
```

Check the URL used by the Next.js proxy in `frontend/src/app/api/chat/route.ts`, and confirm it matches the FastAPI host and port. A successful `/health` response only confirms the API is reachable; it does not prove the model can answer a chat request.

## Conversations appear missing

Conversation state is stored in browser `localStorage`, rather than a hosted database. Check Recent, Archived, and Recently Deleted. Clearing site data or switching browsers/profiles may make conversations unavailable. Recoverability of recently deleted conversations is limited to the application's retention window.

## Checks before opening an issue

```powershell
cd frontend
npx --no-install tsc --noEmit
npx --no-install next build
```

Include the relevant terminal error, the port you opened, and reproducible steps. Redact API keys, tokens, and personal conversation content.
