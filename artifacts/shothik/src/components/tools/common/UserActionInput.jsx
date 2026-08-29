import { lazy, Suspense } from 'react';

import ButtonInsertDocumentText from "@/components/buttons/ButtonInsertDocumentText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardPaste, FileText } from "lucide-react";


const FileUpload = lazy(() => import("./FileUpload"));

import { toast } from "react-toastify";

const UserActionInput = ({
  isMobile,
  setUserInput,
  extraAction,
  disableTrySample = false,
  sampleText,
}) => {
  async function handlePaste() {
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.readText) {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText && clipboardText.trim()) {
          setUserInput(clipboardText);
          if (extraAction) extraAction();
          return;
        }
      }
      toast.info("Please paste text using Ctrl+V or Cmd+V");
    } catch (err) {
      console.warn("Clipboard access:", err);
      toast.info("Please paste text using Ctrl+V or Cmd+V");
    }
  }

  function handleSampleText() {
    const defaultSample =
      "The city buzzed with energy as crowds assembled for the annual parade. Vibrant floats and lively marching bands infused the atmosphere with music and joy, while spectators lined the streets, applauding and waving as the procession moved along.";
    const textToUse = sampleText || defaultSample;
    setUserInput(textToUse);
    if (extraAction) extraAction();
  }

  const handleFileData = (htmlValue) => {
    setUserInput(htmlValue);
    if (extraAction) extraAction();
  };

  return (
    <div className={cn("flex flex-col items-center gap-2")}>
      <div
        id="sample-paste-section"
        className={cn("flex flex-wrap items-center justify-center", "gap-2")}
      >
        {!disableTrySample ? (
          <>
            <Button
              type="button"
              onClick={handleSampleText}
              variant="outline"
              size="sm"
              className={cn("shrink-0 whitespace-nowrap cursor-pointer hover:bg-accent")}
            >
              <FileText className="size-4 mr-1 text-cyan-400" />
              Try Sample
            </Button>
            <span className="text-muted-foreground text-sm">Or</span>
          </>
        ) : null}
        <Button
          type="button"
          onClick={handlePaste}
          variant="outline"
          size="sm"
          className={cn("shrink-0 whitespace-nowrap cursor-pointer hover:bg-accent")}
        >
          <ClipboardPaste className="size-4 mr-1 text-purple-400" />
          Paste Text
        </Button>
      </div>
      <div className="mt-1">
        <ButtonInsertDocumentText
          key="insert-document"
          onApply={(value) => {
            setUserInput(value);
            if (extraAction) extraAction();
          }}
        />
        {/* <div id="upload_button">
          {FileUpload && (
            <FileUpload isMobile={isMobile} setInput={handleFileData} />
          )}
          <p className={cn("text-muted-foreground text-center text-xs")}>
            {isMobile ? "" : "Supported file"} formats: pdf,docx.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default UserActionInput;
