# Spec 0088: Autonomous Cottage Artisan Handloom & Geographical Indication (GI) Export Certification Engine
## Dhakai Jamdani, Tangail Saree, Rajshahi Silk & Fair-Trade Weaver Escrow

### Context & Problem Statement
Bangladesh possesses centuries of artisanal textile heritage officially recognized under the Geographical Indication (GI) framework of the Department of Patents, Designs and Trademarks (DPDT) and the World Intellectual Property Organization (WIPO). Iconic craft categories—such as **Dhakai Jamdani (GI-1)**, **Rangpur Shatranji (GI-3)**, **Rajshahi Silk (GI-8)**, and **Tangail Saree (GI-27)**—represent major export and luxury cottage industries.

However, rural weaving families (*তাঁতি পরিবার*) and modern One-Person Company (OPC) boutique fashion brands face acute systemic barriers:
1. **Counterfeit Machine-Loom Infiltration**: Power-loom synthetic replicas sold as authentic pit-loom Jamdani devalue genuine handloom weaving, causing price collapse and brand dilution in domestic and export markets.
2. **Weaver Wage Exploitation & Advance Yarn Debt**: Weavers often spend 20 to 60 days on a single heritage saree without guaranteed milestone wages, trapping artisan clusters in Rupganj (Narayanganj), Tangail, and Bholahat (Rajshahi) in debt cycles with predatory yarn middlemen (*মহাজন*).
3. **Export Compliance & Certificate of Origin Overhead**: Navigating Export Promotion Bureau (EPB), BSCIC, and Customs HS code documentation requires extensive manual verification of warp/weft counts, pure natural fiber percentages, and Fair-Trade living wage declarations.

### Success Criteria & Acceptance Criteria
- **AC-1: GI Specification & Yarn Warp/Weft Verification**: Audit textile technical specifications against official DPDT/BSCIC GI benchmark registers (yarn count, reed/pick density, natural fiber composition, pit-loom vs power-loom validation).
- **AC-2: Fair-Trade Weaver Wage Escrow State Machine**: Ingest motif complexity level, estimated weaving days, and yarn cost. Compute fair-wage baseline (মজুরি) and manage 3-stage milestone escrow releases (30% yarn setup, 40% midway loom inspection, 30% final audit pass).
- **AC-3: EPB & BSCIC Export Certificate of Origin Compiler**: Auto-generate statutory export certificates with HS tariff codes (e.g. HS 5007.20 / 5208.51), duty rebate coefficients, and a tamper-evident SHA-256 seal.
- **AC-4: REST API Endpoints**: Expose clean endpoints under `/api/v1/trade/artisan-gi/` for GI catalog, authenticity audits, weaver wage escrow, and export certificate generation.
- **AC-5: Accessible AG-UI Frontend Twin Modal**: Deliver `ArtisanGiCraftModal.tsx` with keyboard shortcut `⌘J` / `Ctrl+J`, WAI-ARIA compliance, 36px touch targets, and full screen-reader accessibility.
- **AC-6: 100% Quality & Remote Sync**: Zero TypeScript errors, 100% unit test pass rate across API and UI test suites, integrated into the continuous overnight validation loop and synced across both remotes (`origin` and `frontend`).

### Domain Models & Interfaces
```typescript
export type GiCraftId =
  | 'dhakai_jamdani'
  | 'tangail_saree'
  | 'rajshahi_silk'
  | 'rangpur_shatranji'
  | 'dhakai_muslin';

export type LoomType = 'traditional_pit_loom' | 'throw_shuttle_frame_loom' | 'jacquard_handloom' | 'power_loom';

export type MotifComplexity = 'standard_buti' | 'tercha_floral' | 'jalar_heavy' | 'panna_hazar_royal';

export interface GiCraftProfile {
  craftId: GiCraftId;
  giRegistrationNo: string;
  nameBangla: string;
  nameEnglish: string;
  clusterRegion: string;
  minimumWarpCount: number;
  minimumWeftCount: number;
  allowedLoomTypes: LoomType[];
  hsCode: string;
}
```
