import { describe, it, expect } from "vitest";
import { SalesNegotiationCourierService } from "../sales-negotiation-courier";

describe("SalesNegotiationCourierService", () => {
  it("should accept customer bargain if offered price is within minimum floor", () => {
    const result = SalesNegotiationCourierService.negotiatePrice({
      customerName: "Rahim",
      customerPhone: "01711000000",
      offeredPrice: 1350,
      channel: "whatsapp",
      policy: {
        productName: "Premium Leather Jacket",
        listPrice: 1500,
        minPriceFloor: 1300,
        maxDiscountPercent: 15,
        currency: "BDT ৳",
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.finalPrice).toBe(1350);
    expect(result.aiResponseMessage).toContain("1350");
  });

  it("should counter offer if customer bargains below minimum price floor", () => {
    const result = SalesNegotiationCourierService.negotiatePrice({
      customerName: "Karim",
      customerPhone: "01811000000",
      offeredPrice: 1000,
      channel: "whatsapp",
      policy: {
        productName: "Premium Leather Jacket",
        listPrice: 1500,
        minPriceFloor: 1300,
        maxDiscountPercent: 15,
        currency: "BDT ৳",
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.finalPrice).toBe(1400); // Counter offer (1500 + 1300)/2
    expect(result.aiResponseMessage).toContain("1400");
  });

  it("should auto-book parcel delivery with Steadfast/Pathao Courier API", () => {
    const parcel = SalesNegotiationCourierService.bookParcelDelivery({
      customerName: "Tanvir Hossain",
      customerPhone: "01712345678",
      deliveryAddress: "House 45, Road 11, Banani, Dhaka",
      district: "Dhaka",
      productName: "Winter Jacket",
      itemQuantity: 1,
      cashOnDeliveryAmount: 1350,
      courierProvider: "steadfast",
    });

    expect(parcel.success).toBe(true);
    expect(parcel.trackingCode).toContain("BD_STEADFAST_");
    expect(parcel.trackingUrl).toContain("steadfast.com.bd");
  });
});
