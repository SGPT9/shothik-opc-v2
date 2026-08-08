const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running tsc...');
  const out = execSync('npx tsc --noEmit', { encoding: 'utf-8', cwd: 'c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik' });
  fs.writeFileSync('c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/ts_output.txt', out);
  console.log('Success!');
} catch (e) {
  console.log('Failed!');
  fs.writeFileSync('c:/Users/USER/hermes/shothik-web-mirror-v2/artifacts/shothik/ts_output.txt', e.stdout || e.message);
}
