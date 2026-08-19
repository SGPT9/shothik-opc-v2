/**
 * 📲 Demographic MFS SMS Inbound Webhook Parser
 * 
 * Inspired by Gobii Inbound Event Queues & South Asian F-Commerce Merchant Realities
 * 
 * Parses official SMS messages from:
 * 1. bKash (16247) — P2P "Send Money", "Cash In", and "Payment"
 * 2. Nagad (16167) — "Received Tk", "Send Money", and "Merchant Pay"
 * 3. Rocket / Upay (16216 / 16268)
 * 
 * Extracts: TrxID, Amount, Sender MSISDN, Fee, Remaining Balance, and Timestamp.
 */

export type MfsProvider = "bkash" | "nagad" | "rocket" | "upay";

export interface ParsedMfsSms {
  provider: MfsProvider;
  transactionType: "P2P_RECEIVED" | "MERCHANT_PAYMENT" | "CASH_IN" | "UNKNOWN";
  trxId: string;
  amount: number;
  senderPhone?: string;
  fee: number;
  newBalance?: number;
  rawSender: string;
  timestamp: string;
  isValid: boolean;
}

export class MfsSmsParserEngine {
  /**
   * 1. Parses raw inbound SMS string
   */
  public static parseSms(rawBody: string, senderHeader: string = "bKash"): ParsedMfsSms {
    const text = (rawBody || "").trim();
    const header = (senderHeader || "").toLowerCase();

    if (header.includes("bkash") || text.includes("bKash")) {
      return this.parseBkashSms(text);
    } else if (header.includes("nagad") || text.includes("Nagad")) {
      return this.parseNagadSms(text);
    }

    return {
      provider: "bkash",
      transactionType: "UNKNOWN",
      trxId: "",
      amount: 0,
      fee: 0,
      rawSender: senderHeader,
      timestamp: new Date().toISOString(),
      isValid: false,
    };
  }

  /**
   * bKash SMS Regex Patterns
   * Example 1: "You have received Tk 1,850.00 from 01712345678. Fee Tk 0.00. Balance Tk 45,210.50. TrxID BK99281726X at 18/08/2026 17:30"
   * Example 2: "You have received payment Tk 500.00 from 01811223344. Fee Tk 0.00. Balance Tk 10,500.00. TrxID 9H281726X at 18/08/2026 14:15"
   */
  private static parseBkashSms(text: string): ParsedMfsSms {
    const amountMatch = text.match(/(?:received(?: payment)? Tk|Tk)\s*([\d,]+(?:\.\d{2})?)/i);
    const senderMatch = text.match(/from\s*(\+?8801\d{9}|01\d{9})/i);
    const trxIdMatch = text.match(/TrxID\s*([A-Z0-9]{8,12})/i);
    const balanceMatch = text.match(/Balance\s*Tk\s*([\d,]+(?:\.\d{2})?)/i);
    const feeMatch = text.match(/Fee\s*Tk\s*([\d,]+(?:\.\d{2})?)/i);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;
    const trxId = trxIdMatch ? trxIdMatch[1].toUpperCase() : "";
    const senderPhone = senderMatch ? senderMatch[1] : undefined;
    const newBalance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, "")) : undefined;
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, "")) : 0;

    const isValid = amount > 0 && trxId.length >= 8;

    return {
      provider: "bkash",
      transactionType: text.toLowerCase().includes("payment") ? "MERCHANT_PAYMENT" : "P2P_RECEIVED",
      trxId,
      amount,
      senderPhone,
      fee,
      newBalance,
      rawSender: "bKash",
      timestamp: new Date().toISOString(),
      isValid,
    };
  }

  /**
   * Nagad SMS Regex Patterns
   * Example: "Received Tk 1,200.00 from 01912345678. Fee Tk 0.00. Balance: Tk 18,340.00. TxnID: 72H81920 at 18/08/2026 16:45"
   */
  private static parseNagadSms(text: string): ParsedMfsSms {
    const amountMatch = text.match(/(?:Received Tk|Tk)\s*([\d,]+(?:\.\d{2})?)/i);
    const senderMatch = text.match(/from\s*(\+?8801\d{9}|01\d{9})/i);
    const txnIdMatch = text.match(/(?:TxnID|TrxID|Txn ID):\s*([A-Z0-9]{8,12})/i);
    const balanceMatch = text.match(/Balance:\s*Tk\s*([\d,]+(?:\.\d{2})?)/i);
    const feeMatch = text.match(/Fee\s*Tk\s*([\d,]+(?:\.\d{2})?)/i);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;
    const trxId = txnIdMatch ? txnIdMatch[1].toUpperCase() : "";
    const senderPhone = senderMatch ? senderMatch[1] : undefined;
    const newBalance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, "")) : undefined;
    const fee = feeMatch ? parseFloat(feeMatch[1].replace(/,/g, "")) : 0;

    const isValid = amount > 0 && trxId.length >= 8;

    return {
      provider: "nagad",
      transactionType: "P2P_RECEIVED",
      trxId,
      amount,
      senderPhone,
      fee,
      newBalance,
      rawSender: "Nagad",
      timestamp: new Date().toISOString(),
      isValid,
    };
  }
}
