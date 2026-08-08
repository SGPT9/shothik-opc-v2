const fs = require('fs');
const path = require('path');

const files = [
    'app-next/api/writing-studio/notify-master/route.ts',
    'app-next/api/publish/status/route.ts',
    'app-next/api/tonight-engine/enqueue/route.ts',
    'app-next/api/webhooks/publishdrive/route.ts',
    'app-next/api/publish/submit/route.ts',
    'app-next/api/publish/onix/route.ts',
    'app-next/api/stripe/credits/webhook/route.ts',
    'app-next/api/stripe/subscription/webhook/route.ts',
    'app-next/api/stripe/subscription/portal/route.ts',
    'app-next/api/admin/reviewer-fund/distribute/route.ts',
    'app-next/api/books/manuscript/route.ts',
    'app-next/api/books/export/convert/route.ts',
    'app-next/api/books/export/validate/route.ts',
    'app-next/api/bkash/credits/callback/route.ts'
];

for (const file of files) {
    const fullPath = path.join('C:\\Users\\USER\\hermes\\shothik-web-mirror-v2\\artifacts\\shothik\\src', file);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // We want to replace the conflict block with just the HEAD part
    // The regex matches <<<<<<< HEAD... (keep) ======= (discard) >>>>>>> origin/main...
    const regex = /<<<<<<< HEAD.*?\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>> origin\/main.*?\r?\n/g;

    const newContent = content.replace(regex, '$1');

    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Resolved conflict in: ${file}`);
    } else {
        console.log(`No conflict markers found in: ${file} (or format didn't match)`);
    }
}
