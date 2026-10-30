const DOMPurify = require('isomorphic-dompurify');
const svg = `<svg><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /><script>alert(1)</script></svg>`;
console.log(DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } }));
