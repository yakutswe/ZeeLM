# ZeeLM command reference (Windows PowerShell)

[← README](../README.md)

> Run commands from the specified directory. Commands that install, delete, or publish should be reviewed first. These are documented recipes, **not** claims that each command was previously executed.

## Environment

```powershell
Set-Location 'C:\Users\yakut\zeelm'
Get-Location
Get-ChildItem -Force
node --version
npm --version
py --version
git --version
ollama --version
```

## Ollama

```powershell
ollama pull qwen3:1.7b
ollama list
ollama run qwen3:1.7b
# ollama serve  # Only when Ollama is not already serving in the background
```

## Backend

```powershell
Set-Location 'C:\Users\yakut\zeelm'
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r .\backend\requirements-zeelm.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Some checkouts instead have `backend/requirements.txt`. Use the file actually present; do not create two competing dependency manifests without reason.

```powershell
Invoke-RestMethod 'http://127.0.0.1:8000/health'
$body = @{ message = 'Hello, ZeeLM'; history = @() } | ConvertTo-Json -Depth 5
Invoke-RestMethod 'http://127.0.0.1:8000/chat' -Method Post -ContentType 'application/json' -Body $body
```

## Frontend

```powershell
Set-Location 'C:\Users\yakut\zeelm\frontend'
npm ci       # Or npm install when no lockfile exists
npm run dev
npx --no-install tsc --noEmit
npx --no-install next build
npx --no-install eslint src  # If ESLint is configured
```

## Check port conflicts

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

Use `Get-Process -Id <PID>` with an actual returned process ID. Stop only a server process you recognize; do not kill processes solely to force port 3000.

## Inspect actual source and CSS

```powershell
Set-Location 'C:\Users\yakut\zeelm\frontend'
Select-String -Path '.\src\components\Sidebar.tsx' -Pattern 'zeelm-history-sections','Recently Deleted','onRestore'
Select-String -Path '.\src\app\layout.tsx' -Pattern 'globals.css'
Select-String -Path '.\src\app\globals.css' -Pattern 'zeelm-history-sections'
```

Chrome DevTools Console (for diagnosis only; modifications made here do not persist):

```javascript
const history = document.querySelector('.zeelm-history-sections');
console.log({ loaded: Boolean(history), rowGap: history && getComputedStyle(history).rowGap, sections: history?.children.length });
```

## Git inspection and publishing

```powershell
Set-Location 'C:\Users\yakut\zeelm'
git status
git status --short
git diff --stat
git ls-files
git add README.md .gitignore docs frontend backend
# Inspect staged files before committing:
git diff --cached --stat
git diff --cached --name-only
git commit -m 'docs: publish ZeeLM architecture and development guide'
# After setting up origin and correct branch:
git push -u origin main
```

Before `git add`, verify `.gitignore` and check for accidentally exposed private information. Never run `git add -f` for ignored secrets or checkpoints.

## Source verification

```powershell
Get-ChildItem '.\frontend\src' -Recurse -File | Select-Object FullName
Get-FileHash '.\frontend\src\components\Sidebar.tsx' -Algorithm SHA256
Get-FileHash '.\frontend\src\app\globals.css' -Algorithm SHA256
```

Hashes can be recorded in a release note for provenance but change with every edit.
