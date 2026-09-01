function normalizeText(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim()
}

export async function pptToText(bytes: Uint8Array): Promise<string> {
  try {
    // @ts-ignore
    const CFB = await import('cfb').catch(() => null);
    // @ts-ignore
    const pptParser = (await import('ppt-to-text').catch(() => null))?.default;
    if (!pptParser || !CFB) {
      return Buffer.from(bytes).toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
    }
    const presentation = pptParser.readBuffer(Buffer.from(bytes))
    const slides = pptParser.utils.to_text(presentation)
    return slides
      .map((text: string, index: number) => {
        const content = normalizeText(text)
        return content ? `## Slide ${index + 1}\n${content}` : `## Slide ${index + 1}`
      })
      .join('\n\n')
  } catch {
    return Buffer.from(bytes).toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
  }
}
