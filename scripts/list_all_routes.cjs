const fs = require('fs');
const path = require('path');

const appPath = path.resolve('artifacts/shothik/src/App.tsx');
const content = fs.readFileSync(appPath, 'utf8');

const regex = /<Route\s+path=["']([^"']+)["'](?:\s+component=\{([^}]+)\})?/g;
const routes = [];
let match;
while ((match = regex.exec(content)) !== null) {
  routes.push({
    path: match[1],
    component: match[2] || 'Children / Inline',
  });
}

console.log(`Total Routes in App.tsx: ${routes.length}\n`);
routes.forEach((r, i) => {
  console.log(`${(i + 1).toString().padStart(2, ' ')}. ${r.path.padEnd(36, ' ')} -> ${r.component}`);
});
