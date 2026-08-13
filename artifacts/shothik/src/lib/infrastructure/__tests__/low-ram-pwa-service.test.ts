import { describe, it, expect } from "vitest";
import { LowRamPwaService } from "../low-ram-pwa-service";

describe("LowRamPwaService Demography Optimization Suite", () => {
  it("should register low-spec 2GB RAM Service Worker with 48MB memory limit", () => {
    const sw = LowRamPwaService.registerLowRamPwaServiceWorker();

    expect(sw.status).toBe("registered");
    expect(sw.strategy).toBe("stale-while-revalidate");
    expect(sw.memoryLimitMb).toBe(48);
  });

  it("should generate 1-Tap native bkash:// smartphone deep link", () => {
    const deepLink = LowRamPwaService.generateNativeMfsDeepLink({
      provider: "bkash",
      amountBdt: 1200,
      merchantPhone: "01712345678",
      orderId: "ord_9901",
    });

    expect(deepLink.nativeDeepLink).toBe("bkash://pay?merchant=01712345678&amount=1200&ref=ord_9901");
    expect(deepLink.webFallbackUrl).toContain("pay.bkash.com.bd");
    expect(deepLink.isNativeAppSupported).toBe(true);
  });

  it("should dispatch WhatsApp order receipt & Steadfast tracking code via Pipedream", async () => {
    const dispatch = await LowRamPwaService.dispatchWhatsAppOrderReceipt({
      customerMobile: "8801712345678",
      customerName: "Tanvir Ahmed",
      orderId: "ord_9901",
      amountBdt: 1200,
      trackingCode: "BD_STEADFAST_755448",
    });

    expect(dispatch.dispatchId).toContain("wa_dsp_");
    expect(dispatch.customerMobile).toBe("8801712345678");
    expect(dispatch.status).toBe("delivered");
    expect(dispatch.whatsappMessageId).toContain("wamid_");
  });
});
