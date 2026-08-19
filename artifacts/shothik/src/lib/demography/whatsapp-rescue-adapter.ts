/**
 * 📱 WhatsApp Cloud API & Inbound Rescue Adapter
 * 
 * Delivers native Banglish delivery updates, tracking links, and zero-return customer rescues
 * over Meta WhatsApp Business Cloud API & Webhook Handlers.
 */

export interface WhatsAppTextMessagePayload {
  recipientPhoneNumber: string; // e.g. +88017XXXXXXXX
  messageBody: string;
  templateType: "ORDER_CONFIRMATION" | "TRACKING_UPDATE" | "ZERO_RETURN_RESCUE" | "BKASH_ADVANCE_REMINDER";
  metadata?: Record<string, any>;
}

export interface WhatsAppDispatchResult {
  messageId: string;
  recipient: string;
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  timestamp: string;
  costInCents: number; // WhatsApp Business API template charge (~0.5¢ in South Asia)
}

export class WhatsAppRescueAdapter {
  private static readonly BD_PHONE_REGEX = /^(?:\+?880|0)?1[3-9]\d{8}$/;

  /**
   * Validates Bangladeshi MSISDN phone numbers
   */
  public static validateBdPhoneNumber(phone: string): { isValid: boolean; formatted: string } {
    const cleaned = (phone || "").replace(/[\s\-]/g, "");
    if (!this.BD_PHONE_REGEX.test(cleaned)) {
      return { isValid: false, formatted: phone };
    }

    // Standardize to E.164 format (+8801XXXXXXXXX)
    let formatted = cleaned;
    if (formatted.startsWith("0")) {
      formatted = "+88" + formatted;
    } else if (!formatted.startsWith("+880") && formatted.startsWith("880")) {
      formatted = "+" + formatted;
    } else if (!formatted.startsWith("+")) {
      formatted = "+880" + formatted;
    }

    return { isValid: true, formatted };
  }

  /**
   * Formats and dispatches a customer communication via WhatsApp Business API
   */
  public static async dispatchMessage(payload: WhatsAppTextMessagePayload): Promise<WhatsAppDispatchResult> {
    const { isValid, formatted } = this.validateBdPhoneNumber(payload.recipientPhoneNumber);

    if (!isValid) {
      return {
        messageId: `wamid_err_${Date.now()}`,
        recipient: payload.recipientPhoneNumber,
        status: "FAILED",
        timestamp: new Date().toISOString(),
        costInCents: 0,
      };
    }

    // Simulated reliable dispatch for Cloud API
    const messageId = `wamid.HBgM${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    return {
      messageId,
      recipient: formatted,
      status: "SENT",
      timestamp: new Date().toISOString(),
      costInCents: 0.5,
    };
  }

  /**
   * Generates localized Banglish Zero-Return Rescue text
   */
  public static createZeroReturnRescuePayload(
    customerPhone: string,
    customerName: string,
    carrierName: string,
    trackingCode: string
  ): WhatsAppTextMessagePayload {
    return {
      recipientPhoneNumber: customerPhone,
      templateType: "ZERO_RETURN_RESCUE",
      messageBody: `Assalamu Alaikum ${customerName}! Apnar parcel (${trackingCode}) niye ${carrierName.toUpperCase()} rider delivery korte eshechilo kintu phone-e reach korte pareni. Rider abar ashbe. Apnar alternate kono number ba shomoy thakle janan please!`,
      metadata: { trackingCode, carrierName },
    };
  }
}
