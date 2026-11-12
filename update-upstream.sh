#!/usr/bin/env bash
# Replaces the files this repository takes from FFmpegKitNext (arthenica/ffmpeg-kit-next, LGPL-3.0) - the build
# scripts and FFmpegKit's Android and Apple sources - with another version, and records it in UPSTREAM.
# react-native/ and everything else of ours is left alone. Review the diff, commit, then run native.yml.
#
# Usage: ./update-upstream.sh <tag or commit>    e.g. ./update-upstream.sh v9.0.2
set -euo pipefail

ref="${1:?usage: ./update-upstream.sh <FFmpegKitNext tag or commit>}"
repository="https://github.com/arthenica/ffmpeg-kit-next.git"
paths=(android apple scripts tools android.sh ios.sh)

root="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

git -C "$tmp" init -q
git -C "$tmp" remote add origin "$repository"
git -C "$tmp" fetch -q --depth 1 origin "$ref"
commit="$(git -C "$tmp" rev-parse 'FETCH_HEAD^{commit}')"

for path in "${paths[@]}"; do
  rm -rf "${root:?}/${path}"
done
git -C "$tmp" archive "$commit" "${paths[@]}" | tar -x -C "$root"
rm -rf "$root/tools/docs"
printf 'repository: %s\nref: %s\ncommit: %s\n' "$repository" "$ref" "$commit" > "$root/UPSTREAM"

echo "Upstream files are now FFmpegKitNext ${ref} (${commit})."
