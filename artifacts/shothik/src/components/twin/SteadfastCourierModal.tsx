"use client";

import { useState } from "react";
import {
  Truck,
  Package,
  QrCode,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Smartphone,
  CreditCard,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface SteadfastConsignment {
  id: string;
  consignmentId: string;
  trackingCode: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  district: string;
  codAmountBdt: number;
  weightKg: number;
  itemDescription: string;
  status: "In Transit" | "Delivered" | "Pending Pickup" | "Returned";
  createdAt: string;
}

export interface SteadfastCourierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const INITIAL_CONSIGNMENTS: SteadfastConsignment[] = [
  {
    id: "cs-1",
    consignmentId: "ST-889102",
    trackingCode: "TRK_SF_889102",
    recipientName: "Ahmed Zubair",
    recipientPhone: "01711223344",
    recipientAddress: "House 14, Road 7, Sector 3, Uttara",
    district: "Dhaka",
    codAmountBdt: 1250,
    weightKg: 0.5,
    itemDescription: "Hardcover Book: The AI Entrepreneur Guide",
    status: "In Transit",
    createdAt: "Today, 10:30 AM",
  },
  {
    id: "cs-2",
    consignmentId: "ST-889045",
    trackingCode: "TRK_SF_889045",
    recipientName: "Fatema Tuz Zohra",
    recipientPhone: "01819988776",
    recipientAddress: "GEC Circle, Nasirabad",
    district: "Chittagong",
    codAmountBdt: 2400,
    weightKg: 1.0,
    itemDescription: "Book Bundle (Vol 1 & 2)",
    status: "Delivered",
    createdAt: "Yesterday",
  },
  {
    id: "cs-3",
    consignmentId: "ST-888912",
    trackingCode: "TRK_SF_888912",
    recipientName: "Kazi Nabil",
    recipientPhone: "01915544332",
    recipientAddress: "Zindabazar, Sylhet Sadar",
    district: "Sylhet",
    codAmountBdt: 850,
    weightKg: 0.4,
    itemDescription: "Author Edition Signed Copy",
    status: "Pending Pickup",
    createdAt: "2 days ago",
  },
];

export function SteadfastCourierModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: SteadfastCourierModalProps) {
  const [consignments, setConsignments] = useState<SteadfastConsignment[]>(INITIAL_CONSIGNMENTS);
  const [showNewParcelModal, setShowNewParcelModal] = useState(false);
  const [activeLabel, setActiveLabel] = useState<SteadfastConsignment | null>(null);

  // New Parcel Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [codAmount, setCodAmount] = useState(1250);
  const [itemDesc, setItemDesc] = useState("Hardcover Novel Edition");

  const handleCreateParcel = () => {
    if (!name || !phone || !address) return;

    const newConsignmentId = `ST-${Math.floor(100000 + Math.random() * 900000)}`;
    const newParcel: SteadfastConsignment = {
      id: `cs-${Date.now()}`,
      consignmentId: newConsignmentId,
      trackingCode: `TRK_SF_${newConsignmentId.replace("ST-", "")}`,
      recipientName: name,
      recipientPhone: phone,
      recipientAddress: address,
      district,
      codAmountBdt: Number(codAmount) || 0,
      weightKg: 0.5,
      itemDescription: itemDesc || "Hardcover Book",
      status: "Pending Pickup",
      createdAt: "Just now",
    };

    setConsignments((prev) => [newParcel, ...prev]);

    saveOfflineTask({
      id: `steadfast-task-${Date.now()}`,
      title: `Booked Steadfast COD parcel ${newConsignmentId} for ${name} (৳${codAmount} BDT)`,
      category: "Publish",
      status: "completed",
      cost: "0 Credits",
      updatedAt: Date.now(),
    });

    setName("");
    setPhone("");
    setAddress("");
    setShowNewParcelModal(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-6xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Steadfast Courier COD & Shipping Automation</span>
                <Badge variant="outline" className="border-orange-500/40 text-orange-400 font-mono text-[10px]">
                  All 64 Districts
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Automated nationwide parcel booking, 1-click QR shipping labels, and cash on delivery payout tracking for {companyName}.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowNewParcelModal(true)}
              className="h-8 gap-1.5 bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
              data-testid="button-create-parcel"
            >
              <Plus className="h-3.5 w-3.5" /> Book Parcel
            </Button>
          </div>
        </div>

        {/* Courier Summary KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-950/80 border-b border-slate-800 font-mono text-center shrink-0">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Parcels</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">{consignments.length} Orders</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">In Transit</span>
            <p className="text-base font-bold text-orange-400 mt-0.5">
              {consignments.filter((c) => c.status === "In Transit").length} En Route
            </p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Delivered & Paid</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {consignments.filter((c) => c.status === "Delivered").length} Complete
            </p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Pending COD Payout</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">
              ৳{consignments.reduce((acc, c) => acc + c.codAmountBdt, 0).toLocaleString()} BDT
            </p>
          </div>
        </div>

        {/* Consignment Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40 font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Consignment ID</th>
                  <th className="px-4 py-3">Recipient & Address</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">COD Amount</th>
                  <th className="px-4 py-3">Courier Status</th>
                  <th className="px-4 py-3 text-right">QR Shipping Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {consignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-orange-400">{item.consignmentId}</div>
                      <div className="text-[10px] text-slate-500">{item.trackingCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-200">{item.recipientName}</div>
                      <div className="text-[10px] text-slate-400">{item.recipientPhone}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.recipientAddress}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {item.district}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ৳{item.codAmountBdt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          item.status === "Delivered"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : item.status === "In Transit"
                            ? "border-orange-500/40 text-orange-400 bg-orange-500/10"
                            : "border-slate-700 text-slate-400"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveLabel(item)}
                        className="h-7 text-[11px] gap-1.5 border-slate-700 text-slate-200 hover:bg-slate-800"
                        data-testid={`button-print-label-${item.consignmentId}`}
                      >
                        <QrCode className="h-3.5 w-3.5 text-orange-400" />
                        <span>Print Label</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Parcel Booking */}
        {showNewParcelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl font-mono">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Truck className="h-4 w-4 text-orange-400" /> Book Steadfast COD Parcel
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Phone Number (11 digits)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, Thana..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                    >
                      <option value="Dhaka">Dhaka (৳60)</option>
                      <option value="Chittagong">Chittagong (৳120)</option>
                      <option value="Sylhet">Sylhet (৳120)</option>
                      <option value="Rajshahi">Rajshahi (৳120)</option>
                      <option value="Khulna">Khulna (৳120)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">COD Collection (৳)</label>
                    <input
                      type="number"
                      value={codAmount}
                      onChange={(e) => setCodAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewParcelModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateParcel}
                  className="text-xs bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Printable Shipping Label */}
        {activeLabel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-2xl border-2 border-slate-300 bg-white text-slate-950 p-5 shadow-2xl font-mono space-y-4">
              <div className="border-b-2 border-dashed border-slate-300 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black tracking-tight">STEADFAST COURIER</h4>
                  <p className="text-[10px] text-slate-600">Nationwide Express Delivery</p>
                </div>
                <Badge className="bg-slate-950 text-white text-[10px] font-mono">
                  {activeLabel.district.toUpperCase()}
                </Badge>
              </div>

              {/* Barcode / QR Simulation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <div className="flex justify-center">
                  <QrCode className="h-16 w-16 text-slate-950" />
                </div>
                <p className="text-xs font-black tracking-widest">{activeLabel.consignmentId}</p>
                <p className="text-[9px] text-slate-500">{activeLabel.trackingCode}</p>
              </div>

              {/* Parcel Details */}
              <div className="space-y-1 text-[11px] border-b border-slate-200 pb-3">
                <div className="flex justify-between font-bold">
                  <span>RECIPIENT:</span>
                  <span>{activeLabel.recipientName}</span>
                </div>
                <div className="text-slate-700">{activeLabel.recipientPhone}</div>
                <div className="text-slate-600 text-[10px] leading-snug">{activeLabel.recipientAddress}</div>
              </div>

              <div className="flex items-center justify-between text-xs font-black">
                <span>COLLECT COD:</span>
                <span className="text-base text-rose-600">৳{activeLabel.codAmountBdt} BDT</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveLabel(null)}
                  className="flex-1 text-xs border-slate-400 text-slate-700"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="flex-1 text-xs bg-slate-950 hover:bg-slate-800 text-white gap-1"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
