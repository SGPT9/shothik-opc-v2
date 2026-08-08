// Minimal mock chat backend for local development/testing when the real
// upstream (shothik.work) is unreachable. Emits the same SSE event shapes
// the frontend consumes: conversation, message_start, chunk*, done.
// Usage: node scripts/mock-chat-server.mjs [port]   (default 7788)
// Then run the web dev server with CHAT_API_ORIGIN=http://127.0.0.1:7788
import http from 'node:http';

const port = Number(process.argv[2] ?? 7788);

const REPLY =
  "Here's a quick overview. I can help you shape a startup idea, research competitors and market signals, and test pricing or launch scenarios before you commit. When you're ready, I can turn the conversation into a company workspace with a plan and starter tasks.";

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url?.startsWith('/api/chat')) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      const sendEvent = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

      const conversationId = `mock_${Date.now()}`;
      sendEvent({ type: 'conversation', conversationId });
      sendEvent({ type: 'message_start', messageId: `mockmsg_${Date.now()}` });

      // Simulate a short "thinking" delay before the first token, then
      // stream the reply word by word.
      const words = REPLY.split(' ');
      let i = 0;
      setTimeout(() => {
        const interval = setInterval(() => {
          if (i >= words.length) {
            clearInterval(interval);
            sendEvent({ type: 'done' });
            res.end();
            return;
          }
          sendEvent({ type: 'chunk', content: (i ? ' ' : '') + words[i] });
          i += 1;
        }, 60);
      }, 1500);
    });
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Mock chat SSE server listening on http://0.0.0.0:${port}`);
});
