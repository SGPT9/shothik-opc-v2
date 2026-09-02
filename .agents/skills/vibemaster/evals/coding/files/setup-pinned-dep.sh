#!/usr/bin/env bash
# Fixture: project pinned to commander v2, an API surface far from today's.
# Answering "how should I write this now" from memory of the latest docs
# produces code that does not run here; the lockfile is the ground truth.
# Usage: bash setup-pinned-dep.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-pinned-dep.sh <target-dir>}"
mkdir -p "$TARGET/src"
cd "$TARGET"
cat > package.json <<'EOF'
{
  "name": "notes-cli",
  "version": "0.4.0",
  "bin": { "notes": "./src/cli.js" },
  "dependencies": { "commander": "^2.20.0" }
}
EOF
cat > package-lock.json <<'EOF'
{
  "name": "notes-cli",
  "version": "0.4.0",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/commander": {
      "version": "2.20.3",
      "resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz"
    }
  }
}
EOF
cat > src/cli.js <<'EOF'
#!/usr/bin/env node
const program = require('commander');
program.version('0.4.0');
program.command('list').description('list notes').action(() => console.log('(no notes yet)'));
program.parse(process.argv);
EOF
git init -q && git add -A && git commit -qm "init notes-cli pinned to commander v2"
echo "fixture ready: $TARGET"
