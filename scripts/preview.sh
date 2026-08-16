#!/usr/bin/env bash
# Deploy the current working tree to a Vercel preview URL.
#
#   ./scripts/preview.sh            # deploy and print the URL
#   ./scripts/preview.sh --open     # deploy and open it in the browser
#
# First run walks you through `vercel link` (creates .vercel/, which is gitignored).
# Requires: npx (Node) and a Vercel account. Nothing is deployed to production.

set -euo pipefail

cd "$(dirname "$0")/.."

open_after=false
for arg in "$@"; do
	case "$arg" in
		--open) open_after=true ;;
		-h | --help)
			sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			echo "Unknown option: $arg" >&2
			exit 2
			;;
	esac
done

vercel() { npx --yes vercel@latest "$@"; }

if [ ! -f .vercel/project.json ]; then
	echo "==> No Vercel project linked yet — running 'vercel link'"
	vercel link
fi

branch=$(git rev-parse --abbrev-ref HEAD)
sha=$(git rev-parse --short HEAD)
dirty=""
if [ -n "$(git status --porcelain)" ]; then
	dirty=" (with uncommitted changes)"
fi

echo "==> Deploying preview of '$branch' @ $sha$dirty"
url=$(vercel deploy \
	--archive=tgz \
	--meta "gitBranch=$branch" \
	--meta "gitSha=$sha")

echo
echo "Preview: $url"

if [ "$open_after" = true ]; then
	open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || true
fi
