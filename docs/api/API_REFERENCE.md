# 🔌 Shothik API Ingress Gateway Reference (Port 8080)

> **Version**: 2.6.0  
> **Base URL**: `http://localhost:8080` (Development) / `https://api.shothik.ai` (Production)  
> **Security**: Bearer JWT / API Key Header (`x-api-key`)  

---

## 1. Mobile Financial Services (MFS) Ingress

### `POST /api/v1/mfs/verify-trx`
Verifies a bKash, Nagad, or Rocket transaction ID with 3-layer replay protection and database settlement check.

#### Request Body
```json
{
  "trxId": "9X2A881K0Q",
  "provider": "bkash",
  "expectedAmount": 100,
  "userId": "usr_992184",
  "packType": "quick_pass_100"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "settled": true,
  "trxId": "9X2A881K0Q",
  "amount": 100,
  "creditsGranted": 80,
  "newBalance": 550,
  "settledAt": "2026-08-16T21:40:00.000Z"
}
```

#### Error Codes
* `400 Bad Request`: Invalid TrxID format (must be 10 alphanumeric characters for bKash).
* `409 Conflict`: TrxID already used / replay attack detected.

---

## 2. F-Commerce Logistics & Courier Ingress

### `POST /api/v1/logistics/steadfast/book`
Dispatches an order parcel directly to the Steadfast Courier API and returns a live tracking code.

#### Request Body
```json
{
  "invoice": "INV-9921",
  "recipient_name": "Rahim Chowdhury",
  "recipient_phone": "01711223344",
  "recipient_address": "House 12, Road 4, Dhanmondi, Dhaka",
  "cod_amount": 3400,
  "note": "Handled via Shothik AI Sales Twin"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "consignment": {
    "consignment_id": 882194,
    "invoice": "INV-9921",
    "tracking_code": "ST-882194",
    "status": "in_review",
    "cod_amount": 3400,
    "delivery_charge": 60,
    "created_at": "2026-08-16T21:42:00.000Z"
  }
}
```

---

## 3. Tiered Model Mesh Compute Dispatch

### `POST /api/v1/mesh/dispatch`
Routes natural language prompts dynamically across the 5-Tier Compute Cascade based on budget and complexity.

#### Request Body
```json
{
  "prompt": "Analyze Section 163 of Bangladesh Income Tax Act 2023 regarding minimum tax on apparel export turnover.",
  "complexity": "frontier",
  "budgetLimitBdt": 0.05,
  "stream": true
}
```

#### Response (Server-Sent Events — SSE Stream)
```
event: route
data: {"tier":"Tier 4 (Frontier MoE)","model":"deepseek-r1-70b-q4","costEstimateBdt":0.038}

event: delta
data: {"text":"Under Section 163 of the Bangladesh Income Tax Act 2023..."}

event: done
data: {"status":"complete","tokensUsed":420,"creditsDeducted":2}
```

---

## 4. Ekushey Boi Mela 6x9 Publishing Compiler

### `POST /api/v1/publishing/export-book`
Compiles multi-chapter Bengali manuscripts into print-ready 6x9 trade book PDFs with HarfBuzz font shaping and calculated spine thickness.

#### Request Body
```json
{
  "bookTitle": "নীল জোছনার উপাখ্যান",
  "authorName": "আহসান হাবীব",
  "paperSize": "6x9_trade",
  "paperType": "cream_80gsm",
  "chapters": [
    { "chapterNumber": 1, "title": "প্রথম প্রহর", "content": "..." }
  ]
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "downloadUrl": "https://storage.shothik.ai/books/88214.pdf",
  "pageCount": 192,
  "spineWidthMm": 11.52,
  "fontEmbedded": "Kalpurush.ttf (HarfBuzz Shaped)"
}
```
