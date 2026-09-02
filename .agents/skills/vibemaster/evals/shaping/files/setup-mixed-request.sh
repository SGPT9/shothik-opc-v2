#!/usr/bin/env bash
# Fixture: a personal site mid-revamp, for the mixed-request regression.
# The build items are real, and the placement question has real material:
# seven skills across two series, so "all vs liustack-only vs grouped"
# genuinely forks the information architecture.
# Usage: bash setup-mixed-request.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-mixed-request.sh <target-dir>}"
mkdir -p "$TARGET/site/blog"
cd "$TARGET"
cat > site/index.html <<'EOF'
<!doctype html><title>leon</title>
<h1>leon builds things</h1>
<section id="tools">
  <h2>Tools</h2>
  <ul><li>old-tool-a</li><li>old-tool-b</li></ul>
</section>
EOF
cat > site/blog/index.html <<'EOF'
<!doctype html><title>blog</title><h1>Posts</h1>
<ul><li><a href="post-hello.html">hello world</a></li></ul>
EOF
cat > site/blog/post-hello.html <<'EOF'
<!doctype html><title>hello</title><h1>hello world</h1><p>first post.</p>
EOF
cat > skills-data.json <<'EOF'
{
  "skills": [
    { "name": "shaping",  "series": "liustack" },
    { "name": "coding",   "series": "liustack" },
    { "name": "dig",      "series": "liustack" },
    { "name": "snapshot", "series": "liustack" },
    { "name": "ppt-master",  "series": "standalone" },
    { "name": "style-audit", "series": "standalone" },
    { "name": "markpress",   "series": "standalone" }
  ]
}
EOF
git init -q && git add -A && git commit -qm "site before revamp"
echo "fixture ready: $TARGET"
