// Stub for @tiptap/pm/markdown — not available in @tiptap/pm v3
// These stubs allow the paraphrase components to load without crashing.
export const defaultMarkdownParser = {
  parse: (text: string) => ({ content: [] }),
};
export const defaultMarkdownSerializer = {
  serialize: (doc: unknown) => "",
};
export class MarkdownParser {
  constructor(_schema: unknown, _tokenizer: unknown, _tokens: unknown) {}
  parse(_text: string) { return null; }
}
export class MarkdownSerializer {
  constructor(_nodes: unknown, _marks: unknown) {}
  serialize(_doc: unknown) { return ""; }
}
