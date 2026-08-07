import { NextResponse } from "next/server";

export interface CourierDispatchPayload {
  courierProvider: "steadfast" | "pathao" | "redx" | "delhivery";
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  itemDescription: string;
  amountToCollect: number;
}

export interface CourierDispatchResult {
  success: boolean;
  trackingId: string;
  courierProvider: string;
  estimatedPickup: string;
  deliveryFee: number;
  status: "rider_assigned" | "pickup_scheduled" | "failed";
  message: string;
}

export async function POST(req: Request) {
  try {
    const body: CourierDispatchPayload = await req.json();
    const provider = body.courierProvider || "steadfast";
    const trackingId = `${provider.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const result: CourierDispatchResult = {
      success: true,
      trackingId,
      courierProvider: provider.toUpperCase(),
      estimatedPickup: "Today, 3:30 PM",
      deliveryFee: provider === "steadfast" ? 120 : 150,
      status: "pickup_scheduled",
      message: `🚚 Rider pickup scheduled with ${provider.toUpperCase()}. Tracking ID: [${trackingId}]. Parcel pickup dispatched at seller address.`,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
