import { describe, it, expect } from "vitest";
import { PptxDrawingMLExporter, PresentationDeck } from "../pptx-drawingml-exporter";

describe("📊 pptfast: Native DrawingML Presentation Exporter TDD Suite", () => {
  it("should generate valid DrawingML slide XML with title, bullets, and geometry", () => {
    const deck: PresentationDeck = {
      deckTitle: "Shothik AI Investor Pitch",
      author: "Founder",
      companyName: "Shothik Technologies",
      aspectRatio: "16:9",
      slides: [
        {
          slideNumber: 1,
          title: "The $10B South Asian F-Commerce Dilemma",
          subtitle: "Why 85% of Bangladeshi online shops struggle with COD returns",
          elements: [
            {
              type: "bullet_list",
              content: [
                "Over 70% of transactions are unbanked Cash On Delivery (COD)",
                "Steadfast & Pathao courier delivery failures cost 15% in lost gross margin",
                "Shothik Autonomous Agent Swarm reduces return rates to <4%",
              ],
            },
            {
              type: "callout",
              content: "Key Takeaway: Automated WhatsApp Rescues recover ৳1.8M in trapped COD capital monthly.",
            },
          ],
        },
      ],
    };

    const pkg = PptxDrawingMLExporter.exportDeckPackage(deck);

    expect(pkg.deckTitle).toBe("Shothik AI Investor Pitch");
    expect(pkg.slideCount).toBe(1);
    expect(pkg.presentationManifestXML).toContain("screen16x9");
    expect(pkg.slidesDrawingML[0]).toContain("The $10B South Asian F-Commerce Dilemma");
    expect(pkg.slidesDrawingML[0]).toContain("Steadfast &amp; Pathao");
    expect(pkg.slidesDrawingML[0]).toContain("a:prstGeom prst=\"rect\"");
  });
});
