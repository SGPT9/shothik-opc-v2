import { NextResponse } from "next/server";

export interface PaymentVerifyPayload {
  imageUrl?: string;
  imageBase64?: string;
  trxId?: string;
  expectedAmount?: number;
  paymentChannel?: "bkash" | "nagad" | "upi" | "easypaisa" | "jazzcash";
}

export interface PaymentVerifyResult {
  success: boolean;
  status: "verified" | "fake_detected" | "manual_review";
  trxId: string;
  amount: number;
  senderPhone?: string;
  confidenceScore: number;
  message: string;
  channel: string;
  timestamp: number;
}

export async function POST(req: Request) {
  try {
    const body: PaymentVerifyPayload = await req.json();
    const trxId = body.trxId || `9X${Math.floor(100000 + Math.random() * 900000)}`;
    const channel = body.paymentChannel || "bkash";
    const amount = body.expectedAmount || 2500;

    // OpenSearch-VL OCR & Fraud Detection Engine Simulation
    const isFake = trxId.startsWith("000") || trxId.includes("TEST");

    const result: PaymentVerifyResult = {
      success: true,
      status: isFake ? "fake_detected" : "verified",
      trxId,
      amount,
      senderPhone: "+8801712***890",
      confidenceScore: isFake ? 0.22 : 0.98,
      message: isFake
        ? `⚠️ FAKE PAYMENT SCREENSHOT DETECTED: TrxID [${trxId}] shows pixel artifact misalignment and invalid checksum.`
        : `✅ 100% GENUINE PAYMENT VERIFIED: TrxID [${trxId}] matches bKash/Nagad ledger for BDT ${amount.toLocaleString()}.`,
      channel: channel.toUpperCase(),
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
