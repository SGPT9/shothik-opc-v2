import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Printer, BookOpen, Download, X, ShieldCheck } from 'lucide-react';
import { auditPrintManuscript, type PaperStock } from '@/lib/book/preflight-checker';
import { cn } from '@/lib/utils';

export interface PrintPreflightModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  pageCount?: number;
  isbn?: string;
}

export function PrintPreflightModal({
  isOpen,
  onClose,
  title = 'Untitled Manuscript',
  pageCount = 150,
  isbn = '978-0-306-40615-7',
}: PrintPreflightModalProps) {
  const [stock, setStock] = useState<PaperStock>('80_gsm_offset');
  const [currentIsbn, setCurrentIsbn] = useState(isbn);

  const report = auditPrintManuscript({
    title,
    pageCount,
    paperStock: stock,
    isbn: currentIsbn,
    images: [{ name: 'cover_art.jpg', dpi: 300, colorSpace: 'CMYK' }],
  });

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0b101b] border-slate-800 text-slate-200">
        <DialogTitle className="flex items-center gap-2 text-slate-100 text-base">
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Physical Print Preflight & Press Packet</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-400">
          Verify physical press compliance for Nilkhet/Bangla Academy and POD networks.
        </DialogDescription>

        <div className="space-y-3.5 my-2">
          {/* Status Badge */}
          <div className={cn(
            'p-3 rounded-xl border flex items-center justify-between',
            report.passed ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          )}>
            <div className="flex items-center gap-2">
              {report.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
              <span className="font-semibold text-xs">{report.passed ? 'Press Ready (100% Passed)' : 'Preflight Needs Attention'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase">{report.specs.recommendedDpi} DPI</span>
          </div>

          {/* Paper Stock & Spine Calculations */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Paper Stock</label>
              <select
                value={stock}
                onChange={(e) => setStock(e.target.value as PaperStock)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
              >
                <option value="80_gsm_offset">80 GSM Offset</option>
                <option value="100_gsm_cream">100 GSM Cream</option>
                <option value="70_gsm_newsprint">70 GSM Newsprint</option>
                <option value="120_gsm_art">120 GSM Art Paper</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Spine Width</label>
              <div className="text-xs font-mono font-bold text-indigo-300 py-1">
                {report.spineWidthMm} mm ({pageCount} pages)
              </div>
            </div>
          </div>

          {/* ISBN Validation */}
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">ISBN-13</span>
              <span className="font-mono text-slate-300">{currentIsbn}</span>
            </div>
            <span className={cn('text-[10px] px-2 py-0.5 rounded font-mono font-bold', report.isbnValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
              {report.isbnValid ? 'Verified' : 'Invalid'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400">
            Close
          </Button>
          <Button size="sm" onClick={onClose} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Download Press Packet</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
