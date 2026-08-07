import { NextResponse } from "next/server";

export interface BkashCheckoutPayload {
  amount: number;
  merchantInvoiceNumber: string;
  intent: "sale" | "authorization";
  customerMobileNumber?: string;
}

export interface BkashCheckoutResult {
  success: boolean;
  paymentID: string;
  createTime: string;
  orgLogo: string;
  orgName: string;
  transactionStatus: "Completed" | "Initiated" | "Failed";
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL: string;
}

export async function POST(req: Request) {
  try {
    const body: BkashCheckoutPayload = await req.json();
    const amount = body.amount || 1500;
    const invoice = body.merchantInvoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    const paymentID = `TRX${Date.now()}`;

    const result: BkashCheckoutResult = {
      success: true,
      paymentID,
      createTime: new Date().toISOString(),
      orgLogo: "https://shothik-web-mirror-v2.vercel.app/bkash_logo.png",
      orgName: "Shothik Micro-Enterprise Checkout",
      transactionStatus: "Completed",
      amount: amount.toString(),
      currency: "BDT",
      intent: body.intent || "sale",
      merchantInvoiceNumber: invoice,
      bkashURL: `https://checkout.pay.bKash.com/v1.2.0-beta/pay/checkout?paymentID=${paymentID}`,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
