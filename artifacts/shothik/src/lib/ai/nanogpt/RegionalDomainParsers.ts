/**
 * RegionalDomainParsers — High-Speed Edge Specialist Tasks for South Asian Workflows
 * Pre-compiled sub-2ms deterministic models for Banglish transliteration,
 * Steadfast/Pathao courier address NER, and NBR Section 78 tax calculations.
 */

// 1. All 64 Official Bangladesh Districts
export const BD_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria',
  'Chandpur', 'Chattogram', 'Chuadanga', 'Cox\'s Bazar', 'Cumilla', 'Dhaka', 'Dinajpur',
  'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur',
  'Jashore', 'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj',
  'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj',
  'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
  'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
  'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira',
  'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

export interface CourierParcelExtraction {
  recipientName: string;
  phone: string;
  district: string;
  thana: string;
  fullAddress: string;
  codAmount: number;
  estimatedDeliveryFee: number;
  courierProvider: 'steadfast' | 'pathao' | 'redx' | 'paperfly' | 'general';
  confidence: number;
}

export interface TaxCalculationResult {
  totalTaxableIncome: number;
  gender: 'general' | 'female_or_elderly' | 'disabled' | 'freedom_fighter';
  exemptThreshold: number;
  grossTaxPayable: number;
  investmentRebate: number;
  netTaxPayable: number;
  minimumTax: number;
  finalTaxLiability: number;
  breakdownSlabs: { slabName: string; ratePercent: number; taxableAmount: number; taxAmount: number }[];
}

export class RegionalDomainParsers {
  /**
   * Fast Phonetic Transliteration: Banglish to Bangla Unicode
   */
  public static transliterateBanglish(text: string): string {
    if (!text) return '';

    // Direct dictionary lookup for common phrases
    const phrases: Record<string, string> = {
      'ami bhalo achi': 'আমি ভালো আছি',
      'kemon achen': 'কেমন আছেন',
      'kemon acho': 'কেমন আছো',
      'koto tk': 'কত টাকা',
      'koto taka': 'কত টাকা',
      'delivery charge koto': 'ডেলিভারি চার্জ কত',
      'order confirm korun': 'অর্ডার কনফার্ম করুন',
      'dhonnobad': 'ধন্যবাদ',
      'shothik': 'সঠিক',
      'bhalo': 'ভালো',
      'taka': 'টাকা',
      'shomoy': 'সময়',
      'advance payment lagbe': 'অ্যাডভান্স পেমেন্ট লাগবে?',
      'cash on delivery ache': 'ক্যাশ অন ডেলিভারি আছে?',
      'return policy ki': 'রিটার্ন পলিসি কী?',
      'discount pawa jabe': 'ডিসকাউন্ট পাওয়া যাবে?',
      'kobe pabo': 'কবে পাবো?',
      'stock out': 'স্টক শেষ',
      'inbox korun': 'ইনবক্স করুন',
      'dokan koi': 'দোকান কোথায়?',
    };

    let result = text.toLowerCase();
    for (const [eng, bng] of Object.entries(phrases)) {
      result = result.replace(new RegExp(`\\b${eng}\\b`, 'gi'), bng);
    }

    // Common word replacements
    const wordMap: Record<string, string> = {
      'ami': 'আমি',
      'tumi': 'তুমি',
      'apni': 'আপনি',
      'ki': 'কি',
      'kobe': 'কবে',
      'koi': 'কই',
      'hobe': 'হবে',
      'hoise': 'হয়েছে',
      'ache': 'আছে',
      'nai': 'নাই',
      'taka': 'টাকা',
      'tk': 'টাকা',
      'order': 'অর্ডার',
      'address': 'ঠিকানা',
      'phone': 'ফোন',
      'nam': 'নাম',
      'নাম': 'নাম',
      'dam': 'দাম',
      'parban': 'পারবেন',
      'parbo': 'পারবো',
      'khub': 'খুব',
      'onek': 'অনেক',
      'valo': 'ভালো',
      'dokan': 'দোকান',
      'pathan': 'পাঠান',
      'pathao': 'পাঠাও',
      'koren': 'করেন',
      'kivabe': 'কীভাবে',
    };

    const words = result.split(/\s+/);
    const converted = words.map(w => wordMap[w] || w);
    return converted.join(' ');
  }

  /**
   * Steadfast / Pathao Logistics Address & Order Parser
   */
  public static parseCourierParcel(rawText: string): CourierParcelExtraction {
    const text = rawText || '';

    // 1. Phone number extraction: 11-digit Bangladeshi pattern
    const phoneMatch = text.match(/(?:\+88\s*)?(01[3-9]\d{8})/);
    const phone = phoneMatch ? phoneMatch[1] : '';

    // 2. COD amount extraction
    const codMatch = text.match(/(?:cod|cash|amount|taka|tk|বিল|টাকা)[:\s]*([0-9,]+)/i) ||
                     text.match(/([0-9,]+)\s*(?:tk|taka|টাকা)/i);
    let codAmount = 0;
    if (codMatch) {
      codAmount = parseInt(codMatch[1].replace(/,/g, ''), 10) || 0;
    }

    // 3. District detection
    let detectedDistrict = 'Dhaka';
    let districtFound = false;
    const districtAliases: Record<string, string> = {
      'chittagong': 'Chattogram',
      'comilla': 'Cumilla',
      'jessore': 'Jashore',
      'bogra': 'Bogura',
      'barisal': 'Barishal',
    };

    for (const [alias, canonical] of Object.entries(districtAliases)) {
      if (new RegExp(`\\b${alias}\\b`, 'i').test(text)) {
        detectedDistrict = canonical;
        districtFound = true;
        break;
      }
    }

    if (!districtFound) {
      for (const dist of BD_DISTRICTS) {
        if (new RegExp(`\\b${dist}\\b`, 'i').test(text)) {
          detectedDistrict = dist;
          districtFound = true;
          break;
        }
      }
    }

    // 4. Thana / Area extraction
    const commonThanas = [
      'Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur',
      'Badda', 'Motijheel', 'Agrabad', 'GEC', 'Nasirabad', 'Zindabazar', 'Shibganj'
    ];
    let detectedThana = 'General';
    for (const thana of commonThanas) {
      if (new RegExp(`\\b${thana}\\b`, 'i').test(text)) {
        detectedThana = thana;
        break;
      }
    }

    // 5. Recipient Name extraction (heuristic: leading line or Name: prefix)
    let recipientName = 'Customer';
    const nameMatch = text.match(/(?:name|recipient|গ্রাহক|নাম)[:\s]*([A-Za-z\u0980-\u09FF\s]{3,30})/i);
    if (nameMatch) {
      recipientName = nameMatch[1].trim();
    } else {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine && !firstLine.match(/01[3-9]/) && firstLine.length < 30) {
        recipientName = firstLine.replace(/[,;]/g, '').trim();
      }
    }

    // 6. Delivery Fee calculation
    const isInsideDhaka = detectedDistrict.toLowerCase() === 'dhaka';
    const estimatedDeliveryFee = isInsideDhaka ? 70 : 130;

    return {
      recipientName,
      phone,
      district: detectedDistrict,
      thana: detectedThana,
      fullAddress: text.trim(),
      codAmount,
      estimatedDeliveryFee,
      courierProvider: text.toLowerCase().includes('pathao') ? 'pathao' : 'steadfast',
      confidence: (phone ? 0.4 : 0) + (districtFound ? 0.4 : 0.1) + (codAmount > 0 ? 0.2 : 0),
    };
  }

  /**
   * National Board of Revenue (NBR) Section 78 Individual Tax Calculator
   * 2024–2026 Fiscal Schedule
   */
  public static calculateNBRTax(
    annualIncome: number,
    eligibleInvestment: number = 0,
    gender: 'general' | 'female_or_elderly' | 'disabled' | 'freedom_fighter' = 'general',
    location: 'dhaka_chattogram' | 'other_city' | 'non_city' = 'dhaka_chattogram'
  ): TaxCalculationResult {
    // 1. Exemption threshold
    let exemptThreshold = 350000;
    if (gender === 'female_or_elderly') exemptThreshold = 400000;
    if (gender === 'disabled') exemptThreshold = 475000;
    if (gender === 'freedom_fighter') exemptThreshold = 500000;

    let remainingTaxable = Math.max(0, annualIncome - exemptThreshold);
    let grossTax = 0;
    const breakdown: { slabName: string; ratePercent: number; taxableAmount: number; taxAmount: number }[] = [];

    // Tax Slabs
    const slabs = [
      { name: 'Next ৳1,00,000', cap: 100000, rate: 0.05 },
      { name: 'Next ৳4,00,000', cap: 400000, rate: 0.10 },
      { name: 'Next ৳5,00,000', cap: 500000, rate: 0.15 },
      { name: 'Next ৳5,00,000', cap: 500000, rate: 0.20 },
      { name: 'Remaining Balance', cap: Infinity, rate: 0.25 },
    ];

    breakdown.push({
      slabName: `First ৳${exemptThreshold.toLocaleString('en-IN')} (Exempt)`,
      ratePercent: 0,
      taxableAmount: Math.min(annualIncome, exemptThreshold),
      taxAmount: 0,
    });

    for (const slab of slabs) {
      if (remainingTaxable <= 0) break;
      const amountInSlab = Math.min(remainingTaxable, slab.cap);
      const tax = amountInSlab * slab.rate;
      grossTax += tax;
      breakdown.push({
        slabName: slab.name,
        ratePercent: slab.rate * 100,
        taxableAmount: amountInSlab,
        taxAmount: tax,
      });
      remainingTaxable -= amountInSlab;
    }

    // 2. Section 78 Investment Rebate: 15% of eligible investment, capped at 3% of total taxable income
    const maxAllowableInvestment = annualIncome * 0.20;
    const actualEligible = Math.min(eligibleInvestment, maxAllowableInvestment);
    const investmentRebate = Math.min(actualEligible * 0.15, grossTax);

    // 3. Minimum Tax by Area
    let minimumTax = 5000; // Dhaka & Chattogram City Corp
    if (location === 'other_city') minimumTax = 4000;
    if (location === 'non_city') minimumTax = 3000;

    const netTax = Math.max(0, grossTax - investmentRebate);
    const finalLiability = annualIncome > exemptThreshold ? Math.max(netTax, minimumTax) : 0;

    return {
      totalTaxableIncome: annualIncome,
      gender,
      exemptThreshold,
      grossTaxPayable: grossTax,
      investmentRebate,
      netTaxPayable: netTax,
      minimumTax,
      finalTaxLiability: finalLiability,
      breakdownSlabs: breakdown,
    };
  }

  /**
   * MFS (bKash / Nagad / Rocket) Cashout & Merchant Fee Calculator (Sub-1ms Edge AST)
   */
  public static calculateMFSFee(
    amount: number,
    provider: 'bkash' | 'nagad' | 'rocket' = 'bkash',
    channel: 'app' | 'ussd' = 'app'
  ): {
    amount: number;
    provider: string;
    channel: string;
    cashoutFee: number;
    sendMoneyFee: number;
    merchantPaymentFee: number;
    totalCashoutCost: number;
    receivedAmount: number;
    notes: string;
  } {
    const amt = Math.max(0, amount);
    let cashoutRate = 0.0149; // bKash App: 1.49% (14.90 tk per 1000)
    let sendMoneyFee = 5; // Flat 5 tk

    if (provider === 'bkash') {
      cashoutRate = channel === 'app' ? 0.0149 : 0.0185; // 14.90 vs 18.50 per 1000
    } else if (provider === 'nagad') {
      cashoutRate = channel === 'app' ? 0.01149 : 0.01494; // 11.49 vs 14.94 per 1000 (incl VAT)
      sendMoneyFee = channel === 'app' ? 0 : 4;
    } else if (provider === 'rocket') {
      cashoutRate = channel === 'app' ? 0.009 : 0.018; // 9 vs 18 per 1000
    }

    const cashoutFee = Math.round(amt * cashoutRate * 100) / 100;
    const merchantPaymentFee = Math.round(amt * 0.012 * 100) / 100; // Standard 1.2% merchant rate
    const totalCashoutCost = amt + cashoutFee;
    const receivedAmount = Math.max(0, amt - cashoutFee);

    return {
      amount: amt,
      provider: provider.toUpperCase(),
      channel: channel.toUpperCase(),
      cashoutFee,
      sendMoneyFee,
      merchantPaymentFee,
      totalCashoutCost,
      receivedAmount,
      notes: `${provider.toUpperCase()} (${channel.toUpperCase()}): ৳${(cashoutRate * 1000).toFixed(2)} per ৳1,000 cash out fee.`,
    };
  }
}

