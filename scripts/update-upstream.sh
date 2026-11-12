#!/usr/bin/env bash
# Move the brand changes onto a new upstream Postiz release, the way
# BRANDING.md describes, without touching `brand` until you have checked it.
#
#   scripts/update-upstream.sh v2.26.0            # start
#   scripts/update-upstream.sh --continue         # after fixing a stop by hand
#
# What it does:
#   1. fetches upstream tags and checks the release exists;
#   2. creates `brand-<release>` from `brand` (brand itself is never moved);
#   3. rebases the brand commits onto the release;
#   4. at every stop, lets git rerere replay conflicts resolved before and
#      merges translation JSON key by key (scripts/merge-translations.py),
#      then continues on its own if nothing is left;
#   5. stops only when a conflict needs a person, and says which files;
#   6. at the end, prints what changed that affects deploys.
# It never pushes and never deploys.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
BASE_BRANCH="${BASE_BRANCH:-brand}"
UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
# scripts/ is itself a brand commit, so mid-rebase it is not in the working
# tree until that commit is replayed. Run the helper from a copy in .git.
COPY_DIR="$(git rev-parse --absolute-git-dir)/update-upstream"
HELPER="$COPY_DIR/merge-translations.py"
CONTINUE_CMD="$COPY_DIR/update-upstream.sh --continue"

die() { echo "error: $*" >&2; exit 1; }

rebase_in_progress() { [ -d "$(git rev-parse --git-path rebase-merge)" ] || [ -d "$(git rev-parse --git-path rebase-apply)" ]; }

# Resolve what can be resolved automatically, continue, repeat.
drive_rebase() {
  local status left stopped_at
  while rebase_in_progress; do
    stopped_at="$(git rev-parse REBASE_HEAD)"
    echo
    echo "== stopped at: $(git log -1 --format='%h %s' REBASE_HEAD)"
    set +e
    [ -f "$HELPER" ] || die "missing $HELPER; start again with scripts/update-upstream.sh <tag>"
    python3 -I "$HELPER" --repo "$ROOT"
    status=$?
    set -e
    if [ "$status" -eq 3 ]; then
      echo
      echo "Review the keys above, edit the JSON if needed, 'git add' it, then run:"
      echo "  $CONTINUE_CMD"
      exit 3
    fi
    [ "$status" -eq 0 ] || die "merge-translations.py failed"
    left="$(git diff --name-only --diff-filter=U)"
    if [ -n "$left" ]; then
      echo
      echo "These files need a person (rerere had no earlier resolution):"
      while IFS= read -r f; do
        if git cat-file -e "HEAD:$f" 2>/dev/null; then
          echo "  $f"
        else
          echo "  $f   (deleted upstream: if the brand change only rebranded it, 'git rm' it)"
        fi
      done <<< "$left"
      echo
      echo "For each one: take upstream's side, re-apply only what the brand commit"
      echo "meant to change (see 'git show REBASE_HEAD -- <file>'), 'git add' it, then:"
      echo "  $CONTINUE_CMD"
      echo "To give up and leave '$BASE_BRANCH' as it was:  git rebase --abort"
      exit 2
    fi
    if git diff --cached --quiet; then
      # The resolution equals upstream: everything this brand commit did is
      # already upstream or no longer applies. Drop it rather than loop.
      echo "   nothing left of this commit after resolving; skipping it"
      git rebase --skip >/dev/null 2>&1 || true
    else
      GIT_EDITOR=true git rebase --continue >/dev/null 2>&1 || true
    fi
    if rebase_in_progress && [ "$(git rev-parse -q --verify REBASE_HEAD || true)" = "$stopped_at" ] \
       && [ -z "$(git diff --name-only --diff-filter=U)" ]; then
      die "git could not continue past $(git log -1 --format=%h "$stopped_at"); run 'git status' to see why"
    fi
  done
}

report() {
  local new_tag="$1" old_tag="$2" branch
  branch="$(git branch --show-current)"
  echo
  echo "== '$branch' now has the brand commits on top of $new_tag."
  echo "   '$BASE_BRANCH' has not been changed."
  echo
  echo "Things in this release that matter for deploying:"
  if git diff --quiet "$old_tag" "$new_tag" -- '*.prisma'; then
    echo "  - Database schema: unchanged."
  else
    echo "  - Database schema CHANGED. Deploying runs it against production:"
    git diff --stat "$old_tag" "$new_tag" -- '*.prisma' | sed 's/^/      /'
  fi
  if git diff --quiet "$old_tag" "$new_tag" -- package.json pnpm-lock.yaml; then
    echo "  - Dependencies: unchanged."
  else
    echo "  - Dependencies changed: run 'pnpm install' before building."
  fi
  local node_old node_new
  node_old="$(git show "$old_tag:package.json" | python3 -I -c 'import json,sys; print(json.load(sys.stdin).get("engines",{}).get("node",""))')"
  node_new="$(git show "$new_tag:package.json" | python3 -I -c 'import json,sys; print(json.load(sys.stdin).get("engines",{}).get("node",""))')"
  [ "$node_old" = "$node_new" ] || echo "  - Node version: $node_old -> $node_new (Dockerfile.dev follows upstream)."
  echo
  echo "Upstream name newly visible in the UI (brand the ones that are this app,"
  echo "keep the ones naming real Postiz tools; see BRANDING.md section 4):"
  # Lines upstream added in this release that mention Postiz and are still
  # there after the brand commits were replayed (comments skipped).
  git diff "$old_tag" "$new_tag" -U0 -- 'apps/frontend/src' | python3 -I -c '
import sys
current, found = None, []
for line in sys.stdin:
    if line.startswith("+++ "):
        current = line[6:].rstrip("\n")
    elif line.startswith("+") and "Postiz" in line and current:
        text = line[1:].strip()
        if text.startswith(("//", "{/*", "*", "/*")) or "npm install" in text or "postiz-agent" in text:
            continue
        try:
            still_there = text in open(current, encoding="utf-8").read()
        except OSError:
            still_there = False
        if still_there:
            found.append(f"  {current}: {text[:140]}")
print("\n".join(found) if found else "  (none)")
'
  echo
  echo "Next: pnpm install && pnpm run build, check the app, then follow"
  echo "BRANDING.md to make this branch the new '$BASE_BRANCH'."
}

if [ "${1:-}" = "--continue" ]; then
  rebase_in_progress || die "no rebase in progress"
  [ -z "$(git diff --name-only --diff-filter=U)" ] || die "files still have conflicts: $(git diff --name-only --diff-filter=U | tr '\n' ' ')"
  GIT_EDITOR=true git rebase --continue >/dev/null 2>&1 || true
  drive_rebase
  branch="$(git branch --show-current)"
  report "${branch#brand-}" "$(git config --get "branch.$branch.upstream-from" || true)"
  exit 0
fi

NEW_TAG="${1:-}"
[ -n "$NEW_TAG" ] || die "usage: scripts/update-upstream.sh <release-tag>   (e.g. v2.26.0)"
[ -z "$(git status --porcelain --untracked-files=no)" ] || die "commit or stash your changes first"
rebase_in_progress && die "a rebase is already in progress; finish it or run 'git rebase --abort'"

git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1 \
  || die "no '$UPSTREAM_REMOTE' remote. Add it: git remote add upstream https://github.com/gitroomhq/postiz-app.git"
git fetch "$UPSTREAM_REMOTE" --tags --quiet
git rev-parse -q --verify "refs/tags/$NEW_TAG" >/dev/null \
  || die "no tag $NEW_TAG. Recent releases: $(git tag -l 'v*' | sort -V | tail -5 | tr '\n' ' ')"

OLD_TAG="$(git describe --tags --abbrev=0 --match 'v*' "$BASE_BRANCH")"
[ "$OLD_TAG" != "$NEW_TAG" ] || die "$BASE_BRANCH is already on $NEW_TAG"
git merge-base --is-ancestor "$OLD_TAG" "$NEW_TAG" || die "$NEW_TAG is not newer than $OLD_TAG"

NEW_BRANCH="brand-$NEW_TAG"
git rev-parse -q --verify "refs/heads/$NEW_BRANCH" >/dev/null && die "branch $NEW_BRANCH already exists"

# Remember every conflict resolution, so the next release replays it.
git config rerere.enabled true
git config rerere.autoUpdate true

echo "Rebasing $(git rev-list --count "$OLD_TAG..$BASE_BRANCH") brand commits from $OLD_TAG onto $NEW_TAG"
echo "($(git rev-list --count "$OLD_TAG..$NEW_TAG") upstream commits in between) as '$NEW_BRANCH'."
mkdir -p "$COPY_DIR"
cp scripts/merge-translations.py scripts/update-upstream.sh "$COPY_DIR/"
chmod +x "$COPY_DIR/update-upstream.sh"
git switch --quiet -c "$NEW_BRANCH" "$BASE_BRANCH"
git config "branch.$NEW_BRANCH.upstream-from" "$OLD_TAG"
git -c advice.mergeConflict=false rebase --onto "$NEW_TAG" "$OLD_TAG" "$NEW_BRANCH" >/dev/null || true
rebase_in_progress || git merge-base --is-ancestor "$NEW_TAG" HEAD \
  || die "the rebase did not start; run 'git status' to see why"
drive_rebase
report "$NEW_TAG" "$OLD_TAG"
