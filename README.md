# Personal Website

Static site served from GitHub Pages at [zhanchaoyang.com](https://zhanchaoyang.com).
No build step — the HTML/CSS/JS in this repo is what ships.

## PR previews on Vercel

Every pull request gets a throwaway Vercel deployment so changes can be viewed
before merging. Production stays on GitHub Pages; Vercel is preview-only
(`vercel.json` sends `X-Robots-Tag: noindex` so previews never get indexed).

### One-time setup

1. Create a Vercel project for this repo (Vercel dashboard → Add New → Project →
   import `zyang91/zyang91.github.io`). Framework preset: **Other**, no build
   command, output directory `.`.
2. Create a token at <https://vercel.com/account/tokens>.
3. Get the org and project ids — run `npx vercel link` locally once, then read
   `.vercel/repo.json` (or `.vercel/project.json`, depending on whether the CLI
   linked the repo or a single project). Both files are gitignored, as is the
   `.env.local` the CLI writes — it holds a real token.
4. Add three repository secrets under
   *Settings → Secrets and variables → Actions*:

   | Secret              | Value                            |
   | ------------------- | -------------------------------- |
   | `VERCEL_TOKEN`      | the token from step 2            |
   | `VERCEL_ORG_ID`     | `orgId` from the file in step 3   |
   | `VERCEL_PROJECT_ID` | `id` / `projectId` from the same file |

After that, [`.github/workflows/pr-preview.yml`](.github/workflows/pr-preview.yml)
deploys on every PR open/push and keeps a single sticky comment with the preview
URL and links to the main pages. PRs from forks are skipped, since GitHub does
not expose secrets to them.

### Previewing without a PR

```bash
./scripts/preview.sh --open
```

Deploys the current working tree (including uncommitted edits) to a preview URL.
