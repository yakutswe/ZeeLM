# Publish ZeeLM to GitHub — precise steps

[← README](../README.md)

## 0. Confirm the files are final

Use your **local working tree** as the source. The supplied source archives represent prior snapshots and may not include all current changes. Do not overwrite current code with an old archive just to match the documentation.

In `C:\Users\yakut\zeelm`, copy this documentation package:

```text
README.md
.gitignore
docs/ARCHITECTURE.md
docs/BUILD_GUIDE.md
docs/COMMAND_REFERENCE.md
docs/GITHUB_PUBLISH.md
```

Avoid automatically overwriting an existing `.gitignore`: inspect and **merge** any patterns that preserve your project's needed files.

## 1. Sanity checks

```powershell
Set-Location 'C:\Users\yakut\zeelm'
Get-ChildItem -Force
Test-Path .\frontend\package.json
Test-Path .\frontend\src\components\Sidebar.tsx
Test-Path .\backend\app\main.py
```

Run `npx --no-install next build` from `frontend` and test a message locally before claiming a working release.

## 2. Protect sensitive files

`.gitignore` should exclude virtual environments, Node packages, Next build output, private `.env` files, databases, chat exports, datasets, checkpoint weights and backup copies. Verify whether model files, client documents, secrets and personally identifiable data appear elsewhere in the tree. Remove them **before staging**.

```powershell
git status --short
```

Review carefully even if `git status` is long. `.gitignore` does not remove files already tracked by Git: use `git rm --cached <file>` for accidentally tracked private files, but remember that previously pushed secrets may require rotation and repository history cleanup.

## 3. Create an empty remote repository

1. Sign in at [github.com/new](https://github.com/new).
2. Repository name suggestion: `zeelm`.
3. Add a short description: “Local-first AI workspace built with Next.js, FastAPI, Ollama and Qwen3.”
4. Choose Public only if the full code and any assets are appropriate to share.
5. If initializing from an existing local checkout, **do not** automatically add a remote README or `.gitignore` in the creation form; the local files already contain them.
6. Copy the new HTTPS repository URL: `https://github.com/YOUR_GITHUB_USERNAME/zeelm.git`.

## 4. Initialize Git, only if needed

```powershell
Set-Location 'C:\Users\yakut\zeelm'
git status
```

If the directory is not a Git repository:

```powershell
git init
git branch -M main
```

If it **already is** a repository, do not rerun initialization or rename an existing branch without checking `git branch --show-current` and `git remote -v`.

## 5. Stage and inspect

```powershell
git add README.md .gitignore docs frontend backend
git diff --cached --name-only
git diff --cached --stat
```

Review the staged paths carefully. Make sure `frontend/package.json`, an appropriate lockfile, your real Python dependency manifest and all import-dependent source files are included. Intentionally include project-controlled training code only if safe; exclude private weights and datasets.

## 6. Commit and connect remote

```powershell
git commit -m 'feat: publish ZeeLM local AI studio'
git remote -v
```

If there is no `origin` remote, add one (replace the placeholder):

```powershell
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/zeelm.git
```

If origin exists, inspect it first; avoid overwriting an unrelated remote.

```powershell
git branch --show-current
git push -u origin main
```

If your current branch is not named `main`, use the correct branch in the push command. Authenticate with Git Credential Manager or GitHub's supported sign-in process. Do **not** paste a personal access token into README or shell transcripts intended for publication.

## 7. Update README links

After the push succeeds, your public repository URL is:

`https://github.com/YOUR_GITHUB_USERNAME/zeelm`

Replace `YOUR_GITHUB_USERNAME` in README and other files with the actual owner name. Repository-local Markdown links to `docs/*.md` already work on GitHub and do not need to be rewritten. `localhost` URLs are local setup links, **not** public demos.

## 8. Final repository audit

- [ ] GitHub home page renders the README title, architecture diagram, and details sections.
- [ ] Docs links lead to the four documents.
- [ ] No secrets, chat exports, private backups, model checkpoints, or dependency folders were committed.
- [ ] All required source code and dependency manifests are present.
- [ ] Clone into a separate test folder if possible and follow Quick Start.
- [ ] Confirm screenshots and optional media depict the actual application without disclosing personal data.
- [ ] Add repository topics: `local-ai`, `nextjs`, `fastapi`, `ollama`, `qwen`, `typescript`, `python`.
- [ ] Add a license only after selecting terms you want to grant; no open-source license is implied by public GitHub visibility.

## 9. Future updates

```powershell
Set-Location 'C:\Users\yakut\zeelm'
git status
git add README.md docs frontend backend
git diff --cached --stat
git commit -m 'docs: update ZeeLM implementation notes'
git push
```

The exact source snapshot is defined by each Git commit and (optionally) a Git tag/release. Documentation should be updated when API contracts, storage behavior or the serving model changes.
