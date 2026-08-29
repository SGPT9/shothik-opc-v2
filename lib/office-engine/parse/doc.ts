function normalizeText(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim()
}

/** Extract readable body and text-box content from a legacy Word 97-2003 file. */
export async function docToText(bytes: Uint8Array): Promise<string> {
  try {
    // @ts-ignore
    const WordExtractor = (await import('word-extractor').catch(() => null))?.default;
    if (!WordExtractor) {
      return Buffer.from(bytes).toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }
    const document = await new WordExtractor().extract(Buffer.from(bytes))
    const body = document.getBody({ filterUnicode: false })
    const textboxes = document.getTextboxes({
      filterUnicode: false,
      includeHeadersAndFooters: false,
    })
    return normalizeText([body, textboxes].filter((part) => part.trim()).join('\n'))
  } catch {
    return Buffer.from(bytes).toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
  }
}
