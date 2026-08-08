// Stub for @tiptap/pm/markdown — not available in @tiptap/pm v3
// These stubs allow the paraphrase components to load without crashing.
// Node/mark serializer entries mirror prosemirror-markdown's defaultMarkdownSerializer
// shape closely enough for components that pick individual entries off `nodes`/`marks`.
const noopNodeSerializer = (_state: unknown, _node: unknown) => {};
const noopMarkSerializer = { open: "", close: "", mixable: true, expelEnclosingWhitespace: true };

const stubNodes: Record<string, typeof noopNodeSerializer> = new Proxy(
  {},
  { get: () => noopNodeSerializer },
);
const stubMarks: Record<string, typeof noopMarkSerializer> = new Proxy(
  {},
  { get: () => noopMarkSerializer },
);

export const defaultMarkdownParser = {
  parse: (_text: string) => ({ content: [] }),
};
export const defaultMarkdownSerializer = {
  serialize: (_doc: unknown) => "",
  nodes: stubNodes,
  marks: stubMarks,
};
export class MarkdownParser {
  constructor(_schema: unknown, _tokenizer: unknown, _tokens: unknown) {}
  parse(_text: string) { return null; }
}
export class MarkdownSerializer {
  constructor(_nodes: unknown, _marks: unknown) {}
  serialize(_doc: unknown) { return ""; }
}
