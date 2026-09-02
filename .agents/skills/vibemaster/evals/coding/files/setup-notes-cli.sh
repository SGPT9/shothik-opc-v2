#!/usr/bin/env bash
# Fixture: minimal notes-cli project with stub commands and zero tests.
# Usage: bash setup-notes-cli.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-notes-cli.sh <target-dir>}"
mkdir -p "$TARGET/src"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "notes-cli", "version": "0.3.1", "bin": { "notes": "./src/cli.js" }, "scripts": { "test": "node --test" } }
EOF
cat > src/cli.js <<'EOF'
#!/usr/bin/env node
// notes-cli: add/list/search plain-text notes stored in ~/.notes/
const cmd = process.argv[2];
if (cmd === 'add') { /* append note file */ }
else if (cmd === 'list') { /* print notes sorted by mtime */ }
else if (cmd === 'search') { /* naive grep over note files */ }
else console.log('usage: notes <add|list|search>');
EOF
git init -q && git add -A && git commit -qm "init notes-cli"
echo "fixture ready: $TARGET"
