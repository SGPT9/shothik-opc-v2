import { MushakTaxEngine } from "../tax/mushak-tax-engine.js";

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  bengaliName: string;
  basePrice: number;
  vatRatePercent: number;
  availableSizes: string[];
  availableColors: string[];
  stockCount: number;
  isBestSeller?: boolean;
}

export const SAMPLE_MERCHANT_CATALOG: CatalogProduct[] = [
  {
    id: "prod_panjabi_01",
    sku: "PAN-EMB-BLK",
    name: "Semi-Fitted Embroidered Panjabi",
    bengaliName: "সেমি-ফিটেড এমব্রয়ডারি পাঞ্জাবি",
    basePrice: 1650,
    vatRatePercent: 7.5,
    availableSizes: ["M", "L", "XL", "XXL"],
    availableColors: ["Black", "White", "Maroon", "Navy"],
    stockCount: 42,
    isBestSeller: true,
  },
  {
    id: "prod_polo_02",
    sku: "POLO-CTN-NAVY",
    name: "Pique Cotton Polo Shirt",
    bengaliName: "পিক কটন পোলো শার্ট",
    basePrice: 750,
    vatRatePercent: 5,
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Navy", "Black", "Forest Green"],
    stockCount: 85,
    isBestSeller: true,
  },
  {
    id: "prod_sharee_03",
    sku: "JAM-SILK-RED",
    name: "Traditional Jamdani Silk Sharee",
    bengaliName: "ঐতিহ্যবাহী জামদানি সিল্ক শাড়ি",
    basePrice: 5800,
    vatRatePercent: 7.5,
    availableSizes: ["Free Size"],
    availableColors: ["Red", "Gold", "Royal Blue"],
    stockCount: 12,
    isBestSeller: false,
  },
  {
    id: "prod_tshirt_04",
    sku: "TSH-OVR-WHT",
    name: "Heavyweight Oversized T-Shirt",
    bengaliName: "হেভিওয়েট ওভারসাইজ টি-শার্ট",
    basePrice: 480,
    vatRatePercent: 5,
    availableSizes: ["M", "L", "XL"],
    availableColors: ["White", "Charcoal", "Sage"],
    stockCount: 120,
    isBestSeller: false,
  },
];

export interface SessionSlots {
  productQuery?: string;
  matchedProductId?: string;
  quantity: number;
  size?: string;
  color?: string;
  destinationDistrict?: string;
  isInsideDhaka: boolean;
  paymentMethod: "bKash" | "Nagad" | "COD";
}

export type DisambiguationTier = "DIRECT_BIND" | "INTERACTIVE_MPM" | "MERCHANT_COPILOT";

export interface InteractiveQuickPill {
  id: string;
  title: string;
  description?: string;
  sku?: string;
  price?: number;
}

export interface ExtractedCartResult {
  sessionId: string;
  customerPhone: string;
  confidenceScore: number;
  tier: DisambiguationTier;
  slots: SessionSlots;
  disambiguationPills?: InteractiveQuickPill[];
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    qty: number;
    unitPrice: number;
    vatRatePercent: number;
    lineTotal: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  vatTotal: number;
  deliveryFee: number;
  grandTotal: number;
  isSupervised: boolean;
  supervisionReason?: string;
  suggestedMerchantReplyBangla: string;
  suggestedMerchantReplyEnglish: string;
}

export function extractBanglishQuantity(text: string): number {
  const qtyMatch = text.match(/(\d+)\s*(?:ta|piece|pcs|টি|টা|পিস|জন)?/i);
  if (qtyMatch) {
    const parsed = parseInt(qtyMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) return parsed;
  }
  if (/ekta|akta|১টি|১টা/i.test(text)) return 1;
  if (/duita|duta|২টি|২টা/i.test(text)) return 2;
  if (/tinta|৩টি|৩টা/i.test(text)) return 3;
  if (/charti|charta|৪টি|৪টা/i.test(text)) return 4;
  return 1;
}

export function extractBanglishSize(text: string): string | undefined {
  if (/\b(xxl|2xl)\b/i.test(text)) return "XXL";
  if (/\b(xl)\b/i.test(text)) return "XL";
  if (/\b(large|l)\b/i.test(text) && !/\b(link|live|log)\b/i.test(text)) return "L";
  if (/\b(medium|m)\b/i.test(text) && !/\b(mfs|meta|msg)\b/i.test(text)) return "M";
  if (/\b(small|s)\b/i.test(text) && !/\b(sms|sku)\b/i.test(text)) return "S";
  return undefined;
}

export function extractBanglishColor(text: string): string | undefined {
  if (/kalo|black|কালো/i.test(text)) return "Black";
  if (/shada|white|সাদা/i.test(text)) return "White";
  if (/neel|blue|নীল|navy/i.test(text)) return "Navy";
  if (/maroon|merun|মেরুন/i.test(text)) return "Maroon";
  if (/lal|red|লাল/i.test(text)) return "Red";
  return undefined;
}

export function extractDeliveryLocation(text: string): { isInsideDhaka: boolean; district: string } {
  const insideDhakaKeywords = [
    "dhaka", "dhanmondi", "gulshan", "banani", "mirpur", "uttara", 
    "mohammadpur", "motijheel", "bashundhara", "badda", "khilgaon", "ঢাকা"
  ];
  
  const textLower = text.toLowerCase();
  for (const kw of insideDhakaKeywords) {
    if (textLower.includes(kw)) {
      return { isInsideDhaka: true, district: "Dhaka" };
    }
  }

  const outsideKeywords: Record<string, string> = {
    chittagong: "Chittagong",
    chattogram: "Chittagong",
    চট্টগ্রাম: "Chittagong",
    sylhet: "Sylhet",
    সিলেট: "Sylhet",
    rajshahi: "Rajshahi",
    রাজশাহী: "Rajshahi",
    khulna: "Khulna",
    খুলনা: "Khulna",
    barisal: "Barisal",
    বরিশাল: "Barisal",
    cumilla: "Cumilla",
    comilla: "Cumilla",
    কুমিল্লা: "Cumilla",
    rangpur: "Rangpur",
    রংপুর: "Rangpur",
    gazipur: "Gazipur",
    narayanganj: "Narayanganj",
  };

  for (const [kw, district] of Object.entries(outsideKeywords)) {
    if (textLower.includes(kw)) {
      return { isInsideDhaka: false, district };
    }
  }

  return { isInsideDhaka: true, district: "Dhaka" }; // default to Dhaka with standard rate
}

export function parseWhatsAppCommerceMessage(
  rawText: string,
  customerPhone: string,
  existingSession?: { sessionId: string; previousSlots?: Partial<SessionSlots> }
): ExtractedCartResult {
  const sessionId = existingSession?.sessionId || `wa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const text = rawText.trim();
  
  const qty = extractBanglishQuantity(text);
  const size = extractBanglishSize(text) || existingSession?.previousSlots?.size;
  const color = extractBanglishColor(text) || existingSession?.previousSlots?.color;
  const { isInsideDhaka, district } = extractDeliveryLocation(text);
  
  let matchedProduct: CatalogProduct | undefined;
  let confidenceScore = 0.2;
  const disambiguationPills: InteractiveQuickPill[] = [];

  // Match Catalog
  if (/panjabi|punjabi|পাঞ্জাবি/i.test(text)) {
    matchedProduct = SAMPLE_MERCHANT_CATALOG.find((p) => p.sku.startsWith("PAN"));
    confidenceScore = size && color ? 0.95 : 0.65;
  } else if (/polo|shirt|পোলো|শার্ট/i.test(text)) {
    matchedProduct = SAMPLE_MERCHANT_CATALOG.find((p) => p.sku.startsWith("POLO"));
    confidenceScore = size ? 0.9 : 0.6;
  } else if (/sharee|sari|শাড়ি/i.test(text)) {
    matchedProduct = SAMPLE_MERCHANT_CATALOG.find((p) => p.sku.startsWith("JAM"));
    confidenceScore = color ? 0.95 : 0.7;
  } else if (/tshirt|t-shirt|টি-শার্ট/i.test(text)) {
    matchedProduct = SAMPLE_MERCHANT_CATALOG.find((p) => p.sku.startsWith("TSH"));
    confidenceScore = size ? 0.9 : 0.6;
  }

  if (matchedProduct && (!size || !color)) {
    if (matchedProduct.availableSizes.length > 1 && !size) {
      for (const s of matchedProduct.availableSizes) {
        disambiguationPills.push({
          id: `size_${s}`,
          title: `Size ${s}`,
          description: `In stock for ${matchedProduct.name}`,
          sku: matchedProduct.sku,
          price: matchedProduct.basePrice,
        });
      }
    }
  }

  // Resolve Disambiguation Tier
  let tier: DisambiguationTier = "DIRECT_BIND";
  if (confidenceScore < 0.4 || !matchedProduct) {
    tier = "MERCHANT_COPILOT";
  } else if (confidenceScore >= 0.4 && confidenceScore < 0.85) {
    tier = "INTERACTIVE_MPM";
  } else {
    tier = "DIRECT_BIND";
  }

  const activeProduct = matchedProduct || SAMPLE_MERCHANT_CATALOG[0];
  const items = [
    {
      productId: activeProduct.id,
      sku: activeProduct.sku,
      name: activeProduct.name,
      qty,
      unitPrice: activeProduct.basePrice,
      vatRatePercent: activeProduct.vatRatePercent,
      lineTotal: activeProduct.basePrice * qty,
      size: size || activeProduct.availableSizes[0],
      color: color || activeProduct.availableColors[0],
    },
  ];

  const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
  const deliveryFee = isInsideDhaka ? 60 : 120;

  // Statutory Tax Calculation
  const calculatedTaxItems = items.map((i) =>
    MushakTaxEngine.calculateLineItem({
      id: i.productId,
      itemDescription: i.name,
      quantity: i.qty,
      unit: "pcs",
      unitPriceBdt: i.unitPrice,
      vatRatePercent: i.vatRatePercent,
    })
  );

  const vatTotal = Math.round(calculatedTaxItems.reduce((acc, it) => acc + it.vatAmountBdt, 0) * 100) / 100;
  const grandTotal = subtotal + vatTotal + deliveryFee;

  // Supervised Autonomy Gate
  const isSupervised = grandTotal >= 10000 || /discount|kom|কম|offer/i.test(text);
  const supervisionReason = grandTotal >= 10000 
    ? `High transaction value (৳${grandTotal.toLocaleString()} >= ৳10,000 threshold)`
    : /discount|kom|কম|offer/i.test(text)
    ? "Customer requested manual discount or custom price compromise"
    : undefined;

  const suggestedMerchantReplyBangla = `প্রিয় গ্রাহক, আপনার ${qty}টি ${activeProduct.name} (${items[0].size}, ${items[0].color}) অর্ডার প্রস্তুত। সাবটোটাল: ৳${subtotal}, ভ্যাট (মুসক-৬.৩): ৳${vatTotal}, ডেলিভারি (${district}): ৳${deliveryFee}। মোট: ৳${grandTotal}। bKash বা ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করতে ট্যাপ করুন।`;
  
  const suggestedMerchantReplyEnglish = `Dear customer, your order for ${qty}x ${activeProduct.name} (${items[0].size}, ${items[0].color}) is ready. Subtotal: BDT ${subtotal}, VAT: BDT ${vatTotal}, Courier (${district}): BDT ${deliveryFee}. Grand Total: BDT ${grandTotal}. Tap to confirm via bKash or COD.`;

  return {
    sessionId,
    customerPhone,
    confidenceScore,
    tier,
    slots: {
      productQuery: text,
      matchedProductId: activeProduct.id,
      quantity: qty,
      size: items[0].size,
      color: items[0].color,
      destinationDistrict: district,
      isInsideDhaka,
      paymentMethod: /bkash|বিকাশ/i.test(text) ? "bKash" : "COD",
    },
    disambiguationPills: disambiguationPills.length > 0 ? disambiguationPills : undefined,
    items,
    subtotal,
    vatTotal,
    deliveryFee,
    grandTotal,
    isSupervised,
    supervisionReason,
    suggestedMerchantReplyBangla,
    suggestedMerchantReplyEnglish,
  };
}
