import { describe, it, expect, beforeEach } from "vitest";
import {
  MfsPaymentEngine,
  LogisticsRouter,
  VatTaxEngine,
  SupplyChainEngine,
  BanglishNlpEngine,
} from "../demographic-engines";
import { BkashGateway } from "../bkash-gateway";
import { RouteXpressAdapter } from "../routexpress-adapter";

describe("🇧🇩 Demography-Aware Core Engines — End-to-End TDD Suite", () => {
  describe("1. bKash / Nagad MFS Engine & TrxID Verification", () => {
    let mfs: MfsPaymentEngine;

    beforeEach(() => {
      mfs = new MfsPaymentEngine();
    });

    it("should accurately validate BD 10-character TrxID format", () => {
      expect(MfsPaymentEngine.isValidTrxId("BK99281726X")).toBe(true);
      expect(MfsPaymentEngine.isValidTrxId("NG88192031A")).toBe(true);
      expect(MfsPaymentEngine.isValidTrxId("invalid")).toBe(false);
      expect(MfsPaymentEngine.isValidTrxId("12345")).toBe(false);
      expect(MfsPaymentEngine.isValidTrxId("")).toBe(false);
    });

    it("should validate Bangladesh MSISDN mobile numbers", () => {
      expect(MfsPaymentEngine.isValidMsisdn("01711000000")).toBe(true);
      expect(MfsPaymentEngine.isValidMsisdn("8801812345678")).toBe(true);
      expect(MfsPaymentEngine.isValidMsisdn("01999999999")).toBe(true);
      expect(MfsPaymentEngine.isValidMsisdn("01234567890")).toBe(false); // Invalid operator
      expect(MfsPaymentEngine.isValidMsisdn("12345")).toBe(false);
    });

    it("should calculate correct advance delivery fee for Dhaka vs Outside Dhaka", () => {
      expect(MfsPaymentEngine.calculateAdvanceFee("Dhaka")).toBe(80);
      expect(MfsPaymentEngine.calculateAdvanceFee("Chittagong")).toBe(150);
      expect(MfsPaymentEngine.calculateAdvanceFee("Sylhet")).toBe(150);
      expect(MfsPaymentEngine.calculateAdvanceFee("Rajshahi")).toBe(150);
    });

    it("should create tokenized bKash payment URL and enforce ৳150 advance fee lock", () => {
      const result = mfs.createPayment({
        orderId: "ORD-9912",
        amount: 2500,
        provider: "bkash",
        customerMsisdn: "01711000000",
        advanceDeliveryFeeOnly: true,
      });

      expect(result.requiredFee).toBe(150);
      expect(result.paymentUrl).toContain("pay.bkash.com.bd");
      expect(result.paymentUrl).toContain("amt=150");
    });

    it("should settle transaction on valid TrxID and disburse instant bKash refund", () => {
      const settled = mfs.settleTransaction(
        "BK99281726X",
        "ORD-9912",
        1850,
        "bkash",
        "01711000000"
      );

      expect(settled.status).toBe("settled");
      expect(settled.trxId).toBe("BK99281726X");

      const refund = mfs.disburseRefund("BK99281726X", "Customer requested size exchange");
      expect(refund.status).toBe("DISBURSED_INSTANT_BKASH");
      expect(refund.refundId).toMatch(/^REF_/);
    });
  });

  describe("2. Multi-Carrier Logistics Router (Steadfast / Pathao / RedX)", () => {
    it("should route Dhaka Inside parcels to Steadfast with ৳60 delivery rate and 1-day SLA", () => {
      const consignment = LogisticsRouter.routeCarrier({
        invoiceId: "INV-2026-8891",
        recipientName: "তানভীর আহমেদ",
        recipientPhone: "01711000000",
        recipientAddress: "House 12, Road 4, Dhanmondi",
        district: "Dhaka",
        codAmount: 1850,
        itemWeightKg: 0.5,
      });

      expect(consignment.carrier).toBe("steadfast");
      expect(consignment.deliveryFee).toBe(60);
      expect(consignment.estimatedDays).toBe(1);
      expect(consignment.consignmentId).toMatch(/^ST-\d{6}$/);
      expect(consignment.trackingCode).toMatch(/^TRK-BD-\d{6}$/);
    });

    it("should route Outside-Dhaka parcels with ৳120 rate and generate Banglish WhatsApp notification", () => {
      const consignment = LogisticsRouter.routeCarrier({
        invoiceId: "INV-2026-9021",
        recipientName: "মাহমুদুর রহমান",
        recipientPhone: "01811223344",
        recipientAddress: "GEC Circle, Nasirabad",
        district: "Chittagong",
        codAmount: 3200,
        itemWeightKg: 1.2,
      });

      expect(consignment.deliveryFee).toBe(120);
      expect(consignment.estimatedDays).toBe(3);
      expect(consignment.whatsAppMessage).toContain("Assalamu Alaikum মাহমুদুর রহমান");
      expect(consignment.whatsAppMessage).toContain("Steadfast Courier");
      expect(consignment.whatsAppMessage).toContain(consignment.trackingCode);
      expect(consignment.whatsAppMessage).toContain("৳3200");
    });
  });

  describe("3. NBR VAT Act 2012 & Income Tax Act 2023 Statutory Tax Engine", () => {
    it("should compute standard 15% VAT and generate Mushak-6.3 challan invoice", () => {
      const result = VatTaxEngine.calculateVat(10000, false);

      expect(result.taxableAmount).toBe(10000);
      expect(result.vatRatePercent).toBe(15);
      expect(result.vatAmount).toBe(1500);
      expect(result.totalPayableWithTax).toBe(11500);
      expect(result.mushak63Invoice.challanNo).toMatch(/^MUS-6\.3-\d{6}$/);
      expect(result.mushak63Invoice.binNo).toBe("001928374-0101");
      expect(result.mushak63Invoice.grandTotal).toBe(11500);
    });

    it("should compute 5% Retail Trader VAT rate", () => {
      const result = VatTaxEngine.calculateVat(5000, true);

      expect(result.vatRatePercent).toBe(5);
      expect(result.vatAmount).toBe(250);
      expect(result.totalPayableWithTax).toBe(5250);
    });

    it("should calculate Section 78 Investment Tax Rebate correctly under Income Tax Act 2023", () => {
      // Annual Income: ৳1,200,000. 20% cap = ৳240,000. Actual Investment = ৳200,000.
      // Eligible Investment = ৳200,000. 15% Rebate = ৳30,000.
      const rebate = VatTaxEngine.calculateSection78Rebate(1200000, 200000);

      expect(rebate.maxAllowableInvestment).toBe(200000);
      expect(rebate.rebateAmount).toBe(30000);
    });

    it("should cap Section 78 rebate if investment exceeds 20% income or ৳1,000,000 ceiling", () => {
      // Annual Income: ৳10,000,000. 20% cap = ৳2,000,000. Max ceiling = ৳1,000,000.
      // Actual Investment: ৳1,500,000.
      // Eligible Investment capped at ৳1,000,000. Rebate (15%) = ৳150,000.
      const rebate = VatTaxEngine.calculateSection78Rebate(10000000, 1500000);

      expect(rebate.maxAllowableInvestment).toBe(1000000);
      expect(rebate.rebateAmount).toBe(150000);
    });
  });

  describe("4. Supply Chain Reorder Point (ROP) Forecaster", () => {
    it("should flag CRITICAL stockout risk when stock falls below safety stock threshold", () => {
      const rop = SupplyChainEngine.calculateRop({
        sku: "BD-COTTON-PANJABI-L",
        currentStock: 10,
        dailyVelocity: 5,
        leadTimeDays: 7,
        safetyStockDays: 4, // Safety Stock = 20 units. Lead Demand = 35 units. ROP = 55 units.
      });

      expect(rop.safetyStockUnits).toBe(20);
      expect(rop.reorderPoint).toBe(55);
      expect(rop.stockoutRisk).toBe("CRITICAL");
      expect(rop.suggestedPoQuantity).toBe(140); // 30*5 - 10 = 140
    });

    it("should flag HEALTHY when inventory is well above Reorder Point", () => {
      const rop = SupplyChainEngine.calculateRop({
        sku: "DARAZ-WIRELESS-EARBUDS",
        currentStock: 200,
        dailyVelocity: 4,
        leadTimeDays: 5,
        safetyStockDays: 5,
      });

      expect(rop.reorderPoint).toBe(40); // 20 + 20 = 40
      expect(rop.stockoutRisk).toBe("HEALTHY");
      expect(rop.suggestedPoQuantity).toBe(0);
    });
  });

  describe("5. Banglish NLP & Regional Dialect Tone Classifier", () => {
    it("should classify Dhakaiya, Chatgaiya, and Sylheti regional dialects", () => {
      expect(BanglishNlpEngine.detectDialect("Mama pera nai cholen shuru kori")).toBe("dhakaiya");
      expect(BanglishNlpEngine.detectDialect("Hana gorom ache bhaiya go")).toBe("chatgaiya");
      expect(BanglishNlpEngine.detectDialect("Fua bhalo achi ni mat shonen")).toBe("sylheti");
      expect(BanglishNlpEngine.detectDialect("Apnar lekhapora kemon cholche?")).toBe("standard_bangla");
    });

    it("should detect commercial buyer intent in natural Banglish chats", () => {
      expect(BanglishNlpEngine.isCommercialInquiry("vai black shirt er price koto porbe?")).toBe(true);
      expect(BanglishNlpEngine.isCommercialInquiry("bkash e 150 taka advance delivery fee pathiyechi TrxID check koren")).toBe(true);
      expect(BanglishNlpEngine.isCommercialInquiry("aajke brishti hocche")).toBe(false);
    });
  });

  describe("6. bKash Gateway (Tokenized Sandbox & P2P Send-Money)", () => {
    it("should create tokenized payment URL with grant token", async () => {
      const bkash = new BkashGateway({ isSandbox: true });
      const payment = await bkash.createPayment("ORD-101", 1850, "01711000000");

      expect(payment.paymentId).toMatch(/^TR0011/);
      expect(payment.bkashUrl).toContain("sandbox.payment.bkash.com");
      expect(payment.amount).toBe(1850);
      expect(payment.currency).toBe("BDT");

      const execution = await bkash.executePayment(payment.paymentId);
      expect(execution.transactionStatus).toBe("Completed");
      expect(execution.trxId).toMatch(/^BK99/);
    });

    it("should verify P2P Send-Money TrxID and lock ৳150 delivery advance fee", () => {
      const bkash = new BkashGateway();
      
      // Valid P2P TrxID
      const res1 = bkash.verifyP2pTrxId({
        orderId: "ORD-102",
        trxId: "BK99281726X",
        senderPhone: "01711000000",
        amount: 150,
      });
      expect(res1.isValid).toBe(true);
      expect(res1.isAdvanceFeeLocked).toBe(true);
      expect(res1.status).toBe("VERIFIED_SETTLED");

      // Invalid TrxID
      const res2 = bkash.verifyP2pTrxId({
        orderId: "ORD-103",
        trxId: "short",
        senderPhone: "01711000000",
        amount: 150,
      });
      expect(res2.isValid).toBe(false);
      expect(res2.status).toBe("INVALID_TRXID");
    });
  });

  describe("7. RouteXpress Multi-Courier Logistics Adapter", () => {
    it("should compare rates and recommend lowest cost carrier (Steadfast vs REDX vs Pathao)", () => {
      const quotes = RouteXpressAdapter.compareRates("Dhaka", 1850, 0.5);

      expect(quotes.length).toBe(3);
      expect(quotes[0].carrier).toBe("steadfast"); // Lowest cost
      expect(quotes[0].totalDeliveryCost).toBe(60);
      expect(quotes[0].isRecommended).toBe(true);

      const outsideQuotes = RouteXpressAdapter.compareRates("Chittagong", 2000, 2.5);
      // Weight 2.5kg = 2kg extra = +৳40 surcharge
      const steadfastOutside = outsideQuotes.find(q => q.carrier === "steadfast");
      expect(steadfastOutside?.weightSurcharge).toBe(40); // 2 * 20
    });

    it("should dispatch parcel with tracking code and Banglish WhatsApp confirmation", () => {
      const dispatch = RouteXpressAdapter.dispatchParcel({
        invoice: "INV-2026-9021",
        recipientName: "মাহমুদুর রহমান",
        recipientPhone: "01811223344",
        recipientAddress: "GEC Circle, Nasirabad",
        district: "Chittagong",
        codAmount: 3200,
        weightKg: 1.2,
      }, "steadfast");

      expect(dispatch.carrier).toBe("steadfast");
      expect(dispatch.consignmentId).toMatch(/^ST-\d{6}$/);
      expect(dispatch.trackingCode).toMatch(/^TRK-BD-\d{6}$/);
      expect(dispatch.whatsAppConfirmation).toContain("Assalamu Alaikum মাহমুদুর রহমান");
      expect(dispatch.whatsAppConfirmation).toContain("Steadfast Courier");
    });
  });
});
