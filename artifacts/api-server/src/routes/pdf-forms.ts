import { Router } from "express";
import { globalPdfFormEngine } from "../../../../lib/office-engine/pdf-form-engine";

export const pdfFormsRouter = Router();

pdfFormsRouter.get(["/pdf-forms/templates", "/v1/pdf-forms/templates", "/api/v1/pdf-forms/templates"], (_req, res) => {
  const documents = globalPdfFormEngine.listDocuments();
  res.json({ success: true, count: documents.length, documents });
});

pdfFormsRouter.get(["/pdf-forms/templates/:id", "/v1/pdf-forms/templates/:id", "/api/v1/pdf-forms/templates/:id"], (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const doc = globalPdfFormEngine.getDocument(id);
  if (!doc) {
    res.status(404).json({ success: false, error: "Template not found" });
    return;
  }
  res.json({ success: true, document: doc });
});

pdfFormsRouter.post(["/pdf-forms/templates/:id/fill", "/v1/pdf-forms/templates/:id/fill", "/api/v1/pdf-forms/templates/:id/fill"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const values = (req.body.values as Record<string, string>) || {};
    const result = globalPdfFormEngine.fillForm(id, values);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

pdfFormsRouter.post(["/pdf-forms/templates/:id/receipt", "/v1/pdf-forms/templates/:id/receipt", "/api/v1/pdf-forms/templates/:id/receipt"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recipient = (req.body.recipient as string) || "Dhaka Merchant";
    const channel = req.body.channel || "nilkhet_print";
    const receipt = globalPdfFormEngine.generateDeliveryReceipt(id, recipient, channel);
    res.json({ success: true, receipt });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

pdfFormsRouter.get(["/pdf-forms/receipts/:receiptId", "/v1/pdf-forms/receipts/:receiptId", "/api/v1/pdf-forms/receipts/:receiptId"], (req, res) => {
  const receiptId = Array.isArray(req.params.receiptId) ? req.params.receiptId[0] : req.params.receiptId;
  const receipt = globalPdfFormEngine.getReceipt(receiptId);
  if (!receipt) {
    res.status(404).json({ success: false, error: "Receipt not found" });
    return;
  }
  res.json({ success: true, receipt });
});
