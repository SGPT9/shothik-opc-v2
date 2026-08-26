import { describe, it, expect, vi } from "vitest";
import whatsappRouter from "../whatsapp.js";

describe("WhatsApp Business Webhook Router", () => {
  it("verifies Meta webhook handshake on GET with valid token", () => {
    const req: any = {
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "shothik_whatsapp_verify_token_2026",
        "hub.challenge": "CHALLENGE_CODE_12345",
      },
    };

    let responseStatus = 0;
    let responseBody = "";

    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return {
          send: (body: string) => {
            responseBody = body;
          },
          json: (body: any) => {
            responseBody = body;
          },
        };
      },
    };

    // Find the GET handler from whatsappRouter stack
    const getLayer = (whatsappRouter.stack || []).find(
      (layer: any) => layer.route?.path === "/v1/whatsapp/webhook" && layer.route?.methods?.get
    );

    expect(getLayer).toBeDefined();
    getLayer.route.stack[0].handle(req, res);

    expect(responseStatus).toBe(200);
    expect(responseBody).toBe("CHALLENGE_CODE_12345");
  });

  it("rejects Meta webhook handshake on token mismatch", () => {
    const req: any = {
      query: {
        "hub.mode": "subscribe",
        "hub.verify_token": "invalid_token",
        "hub.challenge": "CHALLENGE_CODE_12345",
      },
    };

    let responseStatus = 0;
    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return {
          json: () => {},
          send: () => {},
        };
      },
    };

    const getLayer = (whatsappRouter.stack || []).find(
      (layer: any) => layer.route?.path === "/v1/whatsapp/webhook" && layer.route?.methods?.get
    );

    getLayer.route.stack[0].handle(req, res);
    expect(responseStatus).toBe(403);
  });

  it("processes inbound WhatsApp customer message on POST", async () => {
    const req: any = {
      body: {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "WABA_ID_001",
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "8801700112233",
                      id: "wamid.HBgLODgwMTcw",
                      text: { body: "Is Polsia Black Denim Jacket available in Size L?" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    };

    let responseStatus = 0;
    let jsonBody: any = null;

    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return {
          json: (data: any) => {
            jsonBody = data;
          },
        };
      },
    };

    const postLayer = (whatsappRouter.stack || []).find(
      (layer: any) => layer.route?.path === "/v1/whatsapp/webhook" && layer.route?.methods?.post
    );

    await postLayer.route.stack[0].handle(req, res);

    expect(responseStatus).toBe(200);
    expect(jsonBody.status).toBe("EVENT_RECEIVED");
  });
});
