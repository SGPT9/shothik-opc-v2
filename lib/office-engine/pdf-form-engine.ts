import { createHash, randomUUID } from "node:crypto";

export type PdfFieldType = "text" | "checkbox" | "radio" | "dropdown";

export interface PdfFormField {
  name: string;
  label: string;
  type: PdfFieldType;
  value: string;
  required: boolean;
  options?: string[];
}

export interface PdfFormDocument {
  id: string;
  title: string;
  filename: string;
  pageCount: number;
  fields: PdfFormField[];
  sha256Seal: string;
  createdAt: string;
  filledAt?: string;
  isCompleted: boolean;
}

export interface PdfDeliveryReceipt {
  receiptId: string;
  documentId: string;
  documentTitle: string;
  recipient: string;
  channel: "nilkhet_print" | "whatsapp" | "email" | "client_download";
  signedHash: string;
  timestamp: string;
  fieldCount: number;
}

export class PdfFormEngine {
  private documents = new Map<string, PdfFormDocument>();
  private receipts = new Map<string, PdfDeliveryReceipt>();

  private computeHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  createTemplate(
    title: string,
    filename: string,
    pageCount: number,
    fields: PdfFormField[],
  ): PdfFormDocument {
    const id = randomUUID();
    const hash = this.computeHash(`${title}:${filename}:${JSON.stringify(fields)}`);

    const doc: PdfFormDocument = {
      id,
      title,
      filename,
      pageCount,
      fields,
      sha256Seal: hash,
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };

    this.documents.set(id, doc);
    return doc;
  }

  getDocument(id: string): PdfFormDocument | null {
    return this.documents.get(id) || null;
  }

  listDocuments(): PdfFormDocument[] {
    return Array.from(this.documents.values());
  }

  fillForm(id: string, values: Record<string, string>): { document: PdfFormDocument; missingFields: string[] } {
    const doc = this.getDocument(id);
    if (!doc) throw new Error("Document template not found");

    const missingFields: string[] = [];

    doc.fields = doc.fields.map((f) => {
      const submitted = values[f.name] !== undefined ? values[f.name] : f.value;
      if (f.required && (!submitted || submitted.trim() === "")) {
        missingFields.push(f.name);
      }
      return { ...f, value: submitted };
    });

    doc.isCompleted = missingFields.length === 0;
    doc.filledAt = new Date().toISOString();
    doc.sha256Seal = this.computeHash(`${doc.title}:${JSON.stringify(doc.fields)}`);

    this.documents.set(id, doc);
    return { document: doc, missingFields };
  }

  generateDeliveryReceipt(
    documentId: string,
    recipient: string,
    channel: PdfDeliveryReceipt["channel"] = "nilkhet_print",
  ): PdfDeliveryReceipt {
    const doc = this.getDocument(documentId);
    if (!doc) throw new Error("Document not found");

    const receiptId = `RCPT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    const signedHash = this.computeHash(`${receiptId}:${doc.id}:${doc.sha256Seal}:${recipient}:${timestamp}`);

    const receipt: PdfDeliveryReceipt = {
      receiptId,
      documentId: doc.id,
      documentTitle: doc.title,
      recipient,
      channel,
      signedHash,
      timestamp,
      fieldCount: doc.fields.length,
    };

    this.receipts.set(receiptId, receipt);
    return receipt;
  }

  getReceipt(receiptId: string): PdfDeliveryReceipt | null {
    return this.receipts.get(receiptId) || null;
  }
}

export const globalPdfFormEngine = new PdfFormEngine();

// Seed standard Nilkhet Form: Trade License & NBR Challan Template
globalPdfFormEngine.createTemplate(
  "Dhaka City Corporation Trade License Application (Form-Kha)",
  "trade_license_dhaka_south.pdf",
  2,
  [
    { name: "business_name", label: "Business Name (ব্যবসা প্রতিষ্ঠানের নাম)", type: "text", value: "", required: true },
    { name: "proprietor_name", label: "Proprietor Name (মালিকের নাম)", type: "text", value: "", required: true },
    { name: "nid_number", label: "NID Number (জাতীয় পরিচয়পত্র নম্বর)", type: "text", value: "", required: true },
    { name: "tin_number", label: "e-TIN Number (১২ ডিজিট ই-টিন)", type: "text", value: "", required: false },
    { name: "trade_type", label: "Business Type", type: "dropdown", value: "E-Commerce", required: true, options: ["E-Commerce", "Retail Store", "Software / ICT Service", "Consultancy"] },
    { name: "declaration_accepted", label: "Declaration Verified", type: "checkbox", value: "false", required: true },
  ],
);
