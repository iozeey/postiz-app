#!/usr/bin/env python3
"""Merge translation JSON files key by key during an upstream rebase.

Line-based merges conflict on almost every upstream release, because upstream
appends keys at the end of every locale file and this fork edits values in the
same files. Merging per key removes those conflicts.

Run it at a stopped `git rebase` (scripts/update-upstream.sh does this for
you). For every locale file the commit being replayed touches:

  * start from the file as it is in HEAD (upstream plus the fork commits
    already replayed), keeping its key order and formatting;
  * apply each key the fork commit added or changed;
  * if upstream also changed that same key to something else, keep the fork's
    value, list the key, and exit with status 3 so a person can review it.

Usage: python3 -I scripts/merge-translations.py [--repo PATH]
"""
import argparse
import json
import subprocess
import sys

LOCALES = "libraries/react-shared-libraries/src/translation/locales/"


def git(repo, *args):
    return subprocess.run(
        ["git", "-C", repo, *args], capture_output=True, check=True
    ).stdout.decode("utf-8")


def load(repo, ref, path):
    try:
        return json.loads(git(repo, "show", f"{ref}:{path}"))
    except subprocess.CalledProcessError:
        return {}  # file did not exist at that ref


def indent_of(text):
    """The indent a file already uses, so a merge never reformats it."""
    for line in text.splitlines()[1:]:
        stripped = line.lstrip(" ")
        if stripped and len(line) != len(stripped):
            return len(line) - len(stripped)
    return 2


def merge_file(repo, path):
    base = load(repo, "REBASE_HEAD^", path)  # before the fork commit
    fork = load(repo, "REBASE_HEAD", path)  # the fork commit
    try:
        head_text = git(repo, "show", f"HEAD:{path}")
    except subprocess.CalledProcessError:
        return None  # upstream deleted it, or the brand commit adds it: leave to git
    head = json.loads(head_text)  # upstream + replayed fork commits

    result = dict(head)
    review = []
    for key, value in fork.items():
        if key in base and base[key] == value:
            continue  # this commit did not touch the key
        upstream_moved = key in head and head[key] != base.get(key) and head[key] != value
        if upstream_moved:
            review.append(key)
        result[key] = value
    for key in base:
        if key not in fork and key in result and result[key] == base[key]:
            del result[key]  # the fork commit removed it and upstream left it alone

    text = json.dumps(result, ensure_ascii=False, indent=indent_of(head_text))
    if head_text.endswith("\n"):
        text += "\n"
    with open(f"{repo}/{path}", "w", encoding="utf-8") as fh:
        fh.write(text)
    git(repo, "add", path)
    return review


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    repo = parser.parse_args().repo

    try:
        git(repo, "rev-parse", "--verify", "REBASE_HEAD")
    except subprocess.CalledProcessError:
        sys.exit("No rebase in progress (REBASE_HEAD is missing).")

    touched = [
        p
        for p in git(repo, "diff-tree", "--no-commit-id", "--name-only", "-r", "REBASE_HEAD").split()
        if p.startswith(LOCALES) and p.endswith(".json")
    ]
    needs_review = {}
    for path in touched:
        review = merge_file(repo, path)
        if review is None:
            print(f"skipped {path} (not in HEAD; resolve it by hand if git flags it)")
            continue
        print(f"merged {path}")
        if review:
            needs_review[path] = review

    if needs_review:
        print("\nUpstream also changed these keys. The fork's value was kept;")
        print("check each one still makes sense against upstream's new wording:")
        for path, keys in needs_review.items():
            for key in keys:
                print(f"  {path}: {key}")
        sys.exit(3)


if __name__ == "__main__":
    main()
