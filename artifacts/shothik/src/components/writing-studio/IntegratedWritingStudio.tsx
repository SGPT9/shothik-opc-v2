

import { useState, useEffect, useCallback } from 'react';

import { ModeSwitcherHeader } from '@/components/writing-studio/navigation/ModeSwitcherHeader';
import { PolishedWriteView } from '@/components/writing-studio/PolishedWriteView';
import { PublishingPage } from '@/components/writing-studio/PublishingPage';
import { AccessibilityReportPanel, validateContentAccessibility } from '@/components/writing-studio/validation';
import type { AccessibilityReport } from '@/components/writing-studio/validation';
import { FeatureGate } from '@/components/subscription/FeatureGate';

type Mode = 'write' | 'format' | 'publish';

interface IntegratedWritingStudioProps {
  projectId: string;
  userId?: string;
}

export function IntegratedWritingStudio({ projectId, userId }: IntegratedWritingStudioProps) {
  const [currentMode, setCurrentMode] = useState<Mode>('write');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [project, setProject] = useState<any>(null);

  // Fetch project data via REST
  useEffect(() => {
    if (!projectId) return;
    let active = true;

    (async () => {
      try {
        const res = await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
          headers: userId ? { 'x-user-id': userId } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && active) {
            setProject(json.data);
          }
        }
      } catch (err) {
        console.warn('[IntegratedWritingStudio] Failed to load project:', err);
      }
    })();

    return () => {
      active = false;
    };
  }, [projectId, userId]);

  // Save handler via REST
  const handleSave = useCallback(async () => {
    if (isSaving || !project || !projectId) return;

    setIsSaving(true);
    try {
      await fetch(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: JSON.stringify({
          content: project.content ?? '',
          sections: project.sections,
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('[IntegratedWritingStudio] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [project, projectId, isSaving, userId]);

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-brand-canvas">
      <ModeSwitcherHeader
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        projectName={project.title}
        onSave={handleSave}
        canUndo={false}
        canRedo={false}
        onUndo={() => {}}
        onRedo={() => {}}
        lastSaved={lastSaved}
        isSaving={isSaving}
      />

      <div className="flex-1 overflow-hidden">
        {currentMode === 'write' && (
          <PolishedWriteView
            bookTitle={project.title}
            project={project}
          />
        )}

        {currentMode === 'format' && (
          <FormatView
            project={project}
            content={project.content ?? ''}
            onPublish={() => setCurrentMode('publish')}
          />
        )}

        {currentMode === 'publish' && (
          <FeatureGate feature="publishingDistribution" fallbackAction={() => setCurrentMode('write')}>
            <PublishingPage
              project={project}
              onBackToEditor={() => setCurrentMode('write')}
            />
          </FeatureGate>
        )}
      </div>
    </div>
  );
}

import { BoiMela3DPageFlipPreview } from '@/components/books/BoiMela3DPageFlipPreview';

// Format View Component
function FormatView({ 
  project, 
  content, 
  onPublish 
}: { 
  project: any; 
  content: string; 
  onPublish: () => void;
}) {
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateAccessibility = async () => {
    setIsValidating(true);
    try {
      const report = validateContentAccessibility(content, {
        title: project.title,
        language: project.language,
      });
      setAccessibilityReport(report);
    } catch (error) {
      console.error('Accessibility validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Split content into 6x9 book pages for 3D flip preview
  const bookPages = [
    {
      pageNumber: 1,
      title: project.title || 'ভূমিকা',
      content: content.slice(0, 450) || 'বাংলা সাহিত্যের অমর একুশে গ্রন্থমেলা প্রকাশনা সংস্করণ...',
    },
    {
      pageNumber: 2,
      title: 'অধ্যায় ১: সূচনা',
      content: content.slice(450, 950) || 'সন্ধ্যার ছায়া যখন বুড়িগঙ্গার জলে নেমে এলো, তখন পুরান ঢাকার অলিগলিতে নিয়ন বাতিগুলো একে একে জ্বলে উঠল...',
    },
    {
      pageNumber: 3,
      title: 'অধ্যায় ১ (ধারাবাহিক)',
      content: content.slice(950, 1450) || 'ক্লান্তিহীন পদধ্বনিতে রাতের নীরবতা ভেঙে যাচ্ছিল। প্রতিটি পৃষ্ঠায় অমর একুশে বইমেলার ঐতিহ্য ও বাংলা মুদ্রণ শিল্পের গৌরব ফুটে উঠেছে।',
    },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Format Settings */}
      <div className="w-[340px] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-brand-surface overflow-y-auto">
        <div className="p-5 space-y-6">
          <div>
            <h1 className="text-base font-bold mb-1">ফরম্যাট ও প্রিন্ট সেটিংস</h1>
            <p className="text-xs text-zinc-500">অমর একুশে গ্রন্থমেলা ৬×৯ ইঞ্চি প্রকাশনা মানদণ্ড।</p>
          </div>

          {/* Typography */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-brand uppercase tracking-wider">মুদ্রণ টাইপোগ্রাফি</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 rounded-xl border-2 border-brand bg-brand/5 text-brand text-left">
                <div className="text-lg font-serif">সোলায়মানলিপি</div>
                <div className="text-[10px] font-medium text-zinc-500 mt-0.5">রয়্যাল ডেমি ৬×৯</div>
              </button>
              <button className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-400 transition-colors">
                <div className="text-lg font-sans">কালপুরুষ</div>
                <div className="text-[10px] font-medium text-zinc-500 mt-0.5">মডার্ন ক্ল্যাসিক</div>
              </button>
            </div>
          </section>

          {/* Accessibility & Nilkhet Print Check */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">কোয়ালিটি ও স্ট্যান্ডার্ড</h3>
            
            <button
              onClick={validateAccessibility}
              disabled={isValidating}
              className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {isValidating ? 'যাচাই করা হচ্ছে...' : 'ইপাব ৩.৩ + ডব্লিউসিএজি ২.২ ভ্যালিডেশন'}
            </button>

            {accessibilityReport && (
              <div className="mt-2">
                <AccessibilityReportPanel 
                  report={accessibilityReport}
                  onRevalidate={validateAccessibility}
                />
              </div>
            )}
          </section>

          {/* Export */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={onPublish}
              className="w-full bg-brand text-white py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all"
            >
              🚀 প্রকাশনা প্যানেলে যান
            </button>
          </div>
        </div>
      </div>

      {/* Center: Live 3D 6x9 BoiMela Page Flip Studio */}
      <div className="flex-1 bg-zinc-900/90 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <BoiMela3DPageFlipPreview
          book={{
            titleBn: project.title || "অমর একুশে বই",
            titleEn: project.titleEn || project.title || "Amar Ekushey Book",
            authorBn: project.author || "লেখক",
            authorEn: project.authorEn || project.author || "Author",
            isbn: "978-984-95432-1-0",
            chapters: [
              {
                id: "ch-1",
                titleBn: project.title || "ভূমিকা ও সূচনা",
                titleEn: "Introduction & Prelude",
                content: [
                  content.slice(0, 450) || "বাংলা সাহিত্যের অমর একুশে গ্রন্থমেলা প্রকাশনা সংস্করণ...",
                  content.slice(450, 950) || "সন্ধ্যার ছায়া যখন বুড়িগঙ্গার জলে নেমে এলো...",
                  content.slice(950, 1450) || "ক্লান্তিহীন পদধ্বনিতে রাতের নীরবতা ভেঙে যাচ্ছিল...",
                ],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
