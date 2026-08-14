import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Quote,
  History,
  Undo,
  Redo,
  Search,
  Loader2,
  X,
  SplitSquareHorizontal,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCitationSuggestions, type CitationResult } from '@/hooks/useCitationSuggestions';
import type { CitationStyle } from '@/lib/reference-list';
import { useGhostText } from '@/hooks/useGhostText';
import { useInlineRewrite } from '../hooks/useInlineRewrite';
import { InlineDiffModal } from '../InlineDiffModal';
import { useVoiceDictation } from '@/hooks/useVoiceDictation';
import { convertBijoyToUnicode } from '@/lib/BijoyConverter';

interface CenterEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  chapterTitle?: string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onRollbackClick?: () => void;
  citationStyle?: CitationStyle;
  onAppendContent?: (html: string) => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
}

export function CenterEditor({
  content = '',
  onChange,
  chapterTitle = 'Untitled',
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onRollbackClick,
  citationStyle = 'APA',
  onAppendContent,
  onTogglePreview,
  showPreview = false,
}: CenterEditorProps) {
  const [showCitationPanel, setShowCitationPanel] = useState(false);
  const [citationQuery, setCitationQuery] = useState('');
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const citationInputRef = useRef<HTMLInputElement>(null);
  const footnoteCountRef = useRef(0);

  const { suggestion, isLoading: ghostLoading, accept: acceptGhost, dismiss: dismissGhost } = useGhostText(content);
  const { suggestions, isSearching, searchPapers, clearSuggestions } = useCitationSuggestions();

  const inlineRewrite = useInlineRewrite((replacementText) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(replacementText).run();
    } else {
      editor.chain().focus().insertContent(replacementText).run();
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your masterpiece… Speak or type in Bengali / English…',
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: 'true',
        class: 'outline-none min-h-[400px]',
        role: 'textbox',
        'aria-label': 'Document editor',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Real-time Voice Dictation
  const handleVoiceTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (!editor || !isFinal) return;
      editor.chain().focus().insertContent(text + ' ').run();
    },
    [editor]
  );

  const { isListening, isSupported: isVoiceSupported, toggleListening } = useVoiceDictation({
    lang: voiceLang,
    onTranscript: handleVoiceTranscript,
  });

  // Audio Proofing (Read Aloud)
  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!editor) return;
    const plainText = editor.getText();
    if (!plainText.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = voiceLang === 'bn-BD' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 1-Click Bijoy to Unicode conversion on current selection or whole document
  const handleConvertBijoyInEditor = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      const selected = editor.state.doc.textBetween(from, to, ' ');
      const converted = convertBijoyToUnicode(selected);
      editor.chain().focus().deleteRange({ from, to }).insertContent(converted).run();
    } else {
      const allText = editor.getText();
      const converted = convertBijoyToUnicode(allText);
      editor.commands.setContent(`<p>${converted.replace(/\n/g, '<br>')}</p>`);
    }
  };

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (currentHtml !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content]);

  return (
    <section
      className="flex-1 flex flex-col bg-white dark:bg-zinc-900/40 relative overflow-hidden h-full"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          inlineRewrite.openRewrite(editor?.getText() || '');
        }
        if (e.key === 'Tab' && suggestion) {
          e.preventDefault();
          acceptGhost(editor);
        }
        if (e.key === 'Escape' && suggestion) {
          e.preventDefault();
          dismissGhost();
        }
      }}
    >
      {/* Top Toolbar */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sticky top-0 bg-white/90 dark:bg-brand-surface/90 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Bold / Italic */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 shrink-0">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              isActive={editor?.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              isActive={editor?.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

          {/* 🎙️ Voice Dictation Button */}
          {isVoiceSupported && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 shrink-0">
              <button
                onClick={toggleListening}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  isListening
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
                title={isListening ? 'Stop Voice Dictation' : 'Start Voice Dictation'}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Listening…' : 'Voice'}</span>
              </button>

              <button
                onClick={() => setVoiceLang(voiceLang === 'bn-BD' ? 'en-US' : 'bn-BD')}
                className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                title="Switch Dictation Language"
              >
                {voiceLang === 'bn-BD' ? 'বাংলা' : 'EN'}
              </button>
            </div>
          )}

          {/* 🎧 Read Aloud (Audio Proofing) */}
          <button
            onClick={toggleReadAloud}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border shrink-0 cursor-pointer',
              isSpeaking
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 animate-pulse'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
            title="Read Chapter Aloud (Audio Proofing)"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>

          {/* 🔤 Bijoy to Unicode */}
          <button
            onClick={handleConvertBijoyInEditor}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition shrink-0 cursor-pointer"
            title="Convert selected or whole Bijoy text to Unicode Bengali"
          >
            <Languages className="w-3 h-3 text-emerald-400" />
            <span>Bijoy ➔ Unicode</span>
          </button>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

          {/* AI Rewrite Button */}
          <button
            onClick={() => inlineRewrite.openRewrite(editor?.getText() || '')}
            title="Inline AI Rewrite (Ctrl+K)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-all border border-brand/20 shadow-xs shrink-0 cursor-pointer"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>AI Rewrite</span>
            <kbd className="text-[10px] opacity-60 font-mono px-1 py-0.5 bg-brand/15 rounded">Ctrl+K</kbd>
          </button>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {onTogglePreview && (
            <>
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
              <ToolbarButton
                onClick={onTogglePreview}
                isActive={showPreview}
                title={showPreview ? 'Hide live book proof' : 'Show live 6x9 book proof'}
              >
                <SplitSquareHorizontal className="w-4 h-4" />
              </ToolbarButton>
            </>
          )}
        </div>
      </div>

      {/* Editor Main Text Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-2xl mx-auto py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 font-serif">
            {chapterTitle}
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed text-zinc-800 dark:text-zinc-200 font-serif space-y-4">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Ghost Text Auto-completion Pill */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-brand-dark border border-zinc-700 rounded-full px-4 py-2 shadow-2xl max-w-[90%]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 animate-pulse" />
            <span className="font-mono text-xs text-zinc-400 italic truncate max-w-[280px]">
              {suggestion.slice(0, 70)}
              {suggestion.length > 70 ? '…' : ''}
            </span>
            <button
              onClick={() => acceptGhost(editor)}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-900/20 px-2 py-0.5 rounded shrink-0 transition-colors"
            >
              Tab ↵
            </button>
            <button
              onClick={dismissGhost}
              className="text-[10px] text-zinc-600 hover:text-zinc-400 shrink-0 transition-colors"
            >
              Esc
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline AI Diff Modal */}
      <InlineDiffModal
        isOpen={inlineRewrite.isOpen}
        selectedText={inlineRewrite.selectedText}
        rewrittenText={inlineRewrite.rewrittenText}
        isStreaming={inlineRewrite.isStreaming}
        error={inlineRewrite.error}
        onClose={inlineRewrite.closeRewrite}
        onAccept={inlineRewrite.acceptRewrite}
        onExecute={inlineRewrite.executeRewrite}
      />
    </section>
  );
}

function ToolbarButton({
  children,
  onClick,
  isActive,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer',
        isActive && 'bg-brand/15 text-brand dark:bg-brand/20 font-bold'
      )}
    >
      {children}
    </button>
  );
}

export default CenterEditor;
