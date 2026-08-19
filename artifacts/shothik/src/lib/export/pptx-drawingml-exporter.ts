/**
 * 📊 pptfast: Native DrawingML Presentation (.pptx) Exporter
 * 
 * Inspired by liustack/pptfast
 * 
 * Transforms Semantic Slide IR into native Microsoft PowerPoint DrawingML XML structures,
 * generating fully editable presentation decks (shapes, text frames, color schemes)
 * with zero dependencies on heavy office suites.
 */

export interface SlideElement {
  type: "heading" | "bullet_list" | "metric_card" | "callout";
  content: string | string[];
  xEMU?: number;
  yEMU?: number;
  cxEMU?: number;
  cyEMU?: number;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  elements: SlideElement[];
  notes?: string;
  themeColorHex?: string;
}

export interface PresentationDeck {
  deckTitle: string;
  author: string;
  companyName: string;
  aspectRatio: "16:9" | "4:3";
  slides: PresentationSlide[];
}

export class PptxDrawingMLExporter {
  /**
   * 1. Converts a PresentationDeck into valid DrawingML slide XML strings
   */
  public static generateSlideDrawingML(slide: PresentationSlide): string {
    const elementsXML = slide.elements
      .map((el, index) => {
        const top = 1800000 + index * 900000;
        if (el.type === "bullet_list" && Array.isArray(el.content)) {
          const bulletRuns = el.content
            .map(
              (item) => `
            <a:p>
              <a:pPr lvl="0" marL="285750"><a:buFont typeface="Arial"/><a:buChar char="•"/></a:pPr>
              <a:r><a:rPr lang="en-US" sz="1600"/><a:t>${this.escapeXml(item)}</a:t></a:r>
            </a:p>`
            )
            .join("");

          return `
          <p:sp>
            <p:nvSpPr><p:cNvPr id="${index + 10}" name="BulletBox_${index}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
            <p:spPr>
              <a:xfrm><a:off x="1000000" y="${top}"/><a:ext cx="10192000" cy="1800000"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              <a:noFill/>
            </p:spPr>
            <p:txBody>
              <a:bodyPr wrap="square" rtlCol="0"/>
              <a:lstStyle/>
              ${bulletRuns}
            </p:txBody>
          </p:sp>`;
        }

        const textContent = Array.isArray(el.content) ? el.content.join(", ") : el.content;
        return `
        <p:sp>
          <p:nvSpPr><p:cNvPr id="${index + 10}" name="TextBox_${index}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
          <p:spPr>
            <a:xfrm><a:off x="1000000" y="${top}"/><a:ext cx="10192000" cy="800000"/></a:xfrm>
            <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
            <a:solidFill><a:srgbClr val="${(slide.themeColorHex || "0f172a").replace("#", "")}"/></a:solidFill>
          </p:spPr>
          <p:txBody>
            <a:bodyPr wrap="square" rtlCol="0"/>
            <a:lstStyle/>
            <a:p><a:r><a:rPr lang="en-US" sz="1800" b="1"/><a:t>${this.escapeXml(textContent)}</a:t></a:r></a:p>
          </p:txBody>
        </p:sp>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      
      <!-- Slide Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="1000000" y="600000"/><a:ext cx="10192000" cy="900000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p><a:r><a:rPr lang="en-US" sz="3200" b="1"/><a:t>${this.escapeXml(slide.title)}</a:t></a:r></a:p>
          ${slide.subtitle ? `<a:p><a:r><a:rPr lang="en-US" sz="1800"/><a:t>${this.escapeXml(slide.subtitle)}</a:t></a:r></a:p>` : ""}
        </p:txBody>
      </p:sp>

      ${elementsXML}
    </p:spTree>
  </p:cSld>
</p:sld>`.trim();
  }

  /**
   * 2. Packages the full presentation deck manifest
   */
  public static exportDeckPackage(deck: PresentationDeck): {
    deckTitle: string;
    slideCount: number;
    slidesDrawingML: string[];
    presentationManifestXML: string;
  } {
    const slidesDrawingML = deck.slides.map((s) => this.generateSlideDrawingML(s));

    const manifestXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></p:sldMasterIdLst>
  <p:sldIdLst>
    ${deck.slides.map((s, idx) => `<p:sldId id="${256 + idx}" r:id="rId${idx + 2}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>`).join("\n    ")}
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
</p:presentation>`.trim();

    return {
      deckTitle: deck.deckTitle,
      slideCount: deck.slides.length,
      slidesDrawingML,
      presentationManifestXML: manifestXML,
    };
  }

  private static escapeXml(unsafe: string): string {
    return (unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
