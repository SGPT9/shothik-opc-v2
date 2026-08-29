// Stub for @tiptap/pm/markdown — not available in @tiptap/pm v3
// Provides safe, functional implementations of MarkdownParser and MarkdownSerializer
// so paraphrase and writing tools can serialize and deserialize text without crashing or returning empty strings.

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

function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (typeof node.text === "string") return node.text;
  if (typeof node.textContent === "string") return node.textContent;
  if (Array.isArray(node.content)) {
    return node.content.map(extractText).filter(Boolean).join("\n\n");
  }
  if (node.content && typeof node.content.descendants === "function") {
    let result = "";
    node.content.descendants((child: any) => {
      if (child.isText && child.text) result += child.text;
    });
    return result;
  }
  return "";
}

export const defaultMarkdownParser = {
  parse: (text: string) => ({
    toJSON: () => ({
      type: "doc",
      content: text
        ? text.split("\n\n").map((p) => ({
            type: "paragraph",
            content: p ? [{ type: "text", text: p }] : [],
          }))
        : [],
    }),
  }),
};

export const defaultMarkdownSerializer = {
  serialize: (doc: unknown) => extractText(doc),
  nodes: stubNodes,
  marks: stubMarks,
};

export class MarkdownParser {
  constructor(_schema?: unknown, _tokenizer?: unknown, _tokens?: unknown) {}
  parse(text: string) {
    return defaultMarkdownParser.parse(text);
  }
}

export class MarkdownSerializer {
  constructor(_nodes?: unknown, _marks?: unknown) {}
  serialize(doc: unknown) {
    return extractText(doc);
  }
}
