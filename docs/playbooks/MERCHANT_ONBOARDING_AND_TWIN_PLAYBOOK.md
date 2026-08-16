# 🛍️ F-Commerce Merchant Onboarding & Autonomous Sales Twin Playbook

> **Goal**: Get an F-Commerce boutique or shop fully automated with an AI Sales Twin in under 15 minutes.  
> **Key Capabilities**: 24/7 DM Closing &middot; 1-Tap bKash Verification &middot; Steadfast Courier Auto-Booking  

---

## ⚡ 15-Minute Setup Checklist

### Step 1: Initialize Your Store Twin (3 Minutes)
1. Open Shothik and navigate to **`/twin`**.
2. Name your Business Twin (e.g. *Ayesha*) and set your brand tone (*"Warm, polite, speaks natural Dhaka Banglish with emojis"*).
3. Upload your product catalog CSV or paste your product list:
   - *Product Name, SKU, Price (BDT), Color Variants, Sizes Available, Stock Count*.

---

### Step 2: Connect Payment & Courier Credentials (5 Minutes)
1. Open **Settings ➔ Integrations**.
2. **bKash Merchant PGW**:
   - Paste your `App Key`, `App Secret`, and `Merchant Number`.
3. **Steadfast Courier API**:
   - Paste your `API Key` and `Secret Key`.
4. Click **[ Test Connections ]** to verify the green status indicators.

---

### Step 3: Enable Autonomous DM Responses (4 Minutes)
1. Connect your Facebook Page / WhatsApp Business webhook to `https://api.shothik.ai/webhooks/fcommerce`.
2. Set your operating rules:
   - *Auto-Verify Payments*: Enable for amounts under ৳10,000.
   - *Auto-Dispatch Parcels*: Enable for confirmed addresses.

---

### Step 4: Manage Orders on Twenty CRM Kanban (3 Minutes)
* Open the **Side Canvas ➔ CRM Tab** to view live customer stages:
  1. `💬 Inquiring` (Customer browsing products)
  2. `💳 Payment Pending` (TrxID requested)
  3. `🚚 Dispatched on Steadfast` (Tracking code generated)
  4. `✅ Delivered & Settled` (COD funds credited to merchant wallet)

---

## 💬 Recommended Customer Notification Template

```
Assalamu Alaikum [Customer Name],

Your order for [Product Name] has been confirmed! 🎉
🚚 Steadfast Tracking Code: [ST-882194]
📍 Delivery Address: [Customer Address]
💰 Total Amount: ৳[Amount] (COD)

Track your delivery here: https://steadfast.com.bd/t/[ST-882194]
Thank you for shopping with us! ❤️
```
