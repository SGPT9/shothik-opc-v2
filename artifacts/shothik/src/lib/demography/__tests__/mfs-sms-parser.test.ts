import { describe, it, expect } from "vitest";
import { MfsSmsParserEngine } from "../mfs-sms-parser";

describe("📲 Demographic MFS SMS Parser TDD Suite", () => {
  it("should parse official bKash P2P Send Money SMS", () => {
    const rawSms = "You have received Tk 1,850.00 from 01712345678. Fee Tk 0.00. Balance Tk 45,210.50. TrxID BK99281726X at 18/08/2026 17:30";
    const result = MfsSmsParserEngine.parseSms(rawSms, "bKash");

    expect(result.isValid).toBe(true);
    expect(result.provider).toBe("bkash");
    expect(result.transactionType).toBe("P2P_RECEIVED");
    expect(result.amount).toBe(1850);
    expect(result.trxId).toBe("BK99281726X");
    expect(result.senderPhone).toBe("01712345678");
    expect(result.newBalance).toBe(45210.5);
    expect(result.fee).toBe(0);
  });

  it("should parse official Nagad P2P SMS", () => {
    const rawSms = "Received Tk 1,200.00 from 01912345678. Fee Tk 0.00. Balance: Tk 18,340.00. TxnID: 72H81920 at 18/08/2026 16:45";
    const result = MfsSmsParserEngine.parseSms(rawSms, "Nagad");

    expect(result.isValid).toBe(true);
    expect(result.provider).toBe("nagad");
    expect(result.amount).toBe(1200);
    expect(result.trxId).toBe("72H81920");
    expect(result.senderPhone).toBe("01912345678");
    expect(result.newBalance).toBe(18340);
  });
});
