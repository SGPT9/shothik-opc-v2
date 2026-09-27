import { Router } from "express";
import { globalPdfFormEngine } from "../../../../lib/office-engine/pdf-form-engine";

export const pdfFormsRouter = Router();

pdfFormsRouter.get("/pdf-forms/templates", (_req, res) => {
  const documents = globalPdfFormEngine.listDocuments();
  res.json({ success: true, count: documents.length, documents });
});

pdfFormsRouter.get("/pdf-forms/templates/:id", (req, res) => {
  const doc = globalPdfFormEngine.getDocument(req.params.id);
  if (!doc) {
    res.status(404).json({ success: false, error: "Template not found" });
    return;
  }
  res.json({ success: true, document: doc });
});

pdfFormsRouter.post("/pdf-forms/templates/:id/fill", (req, res) => {
  try {
    const values = (req.body.values as Record<string, string>) || {};
    const result = globalPdfFormEngine.fillForm(req.params.id, values);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

pdfFormsRouter.post("/pdf-forms/templates/:id/receipt", (req, res) => {
  try {
    const recipient = (req.body.recipient as string) || "Dhaka Merchant";
    const channel = req.body.channel || "nilkhet_print";
    const receipt = globalPdfFormEngine.generateDeliveryReceipt(req.params.id, recipient, channel);
    res.json({ success: true, receipt });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

pdfFormsRouter.get("/pdf-forms/receipts/:receiptId", (req, res) => {
  const receipt = globalPdfFormEngine.getReceipt(req.params.receiptId);
  if (!receipt) {
    res.status(404).json({ success: false, error: "Receipt not found" });
    return;
  }
  res.json({ success: true, receipt });
});
