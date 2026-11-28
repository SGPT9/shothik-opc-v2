

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/ui/useMobile";
import { useRegisterUserToBetaListMutation } from "@/redux/api/auth/authApi";
import { CheckCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import EmailModal from "../home/EmailCollectModal";
import EmailModal from "@/components/(primary-layout)/(home-v2-page)/(home-components)/EmailCollectModal";
import { resetSheetState } from "@/redux/slices/sheetSlice";
import { useDispatch } from "react-redux";
import SheetChatArea from "./SheetChatArea";
import SheetDataArea from "./SheetDataArea";

export default function SheetAgentPage({ specificAgent, sheetId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isMobile = useIsMobile();
  const dispatch = useDispatch();

  useEffect(() => {
    const initialPrompt = sessionStorage.getItem("initialPrompt");
    if (initialPrompt) {
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        message: initialPrompt,
        timestamp: new Date().toISOString(),
        isOptimistic: true,
      };
      setOptimisticMessages((prev) => [...prev, optimisticMessage]);
      setIsLoading(true);
      sessionStorage.removeItem("initialPrompt");
    }
  }, []);

  const handlePreviewOpen = () => setPreviewOpen(true);
  const handlePreviewClose = () => setPreviewOpen(false);

  useEffect(() => {
    return () => {
      dispatch(resetSheetState());
    };
  }, []);

  return (
    <div className="bg-background text-foreground flex h-[calc(100dvh-50px)] flex-col overflow-hidden lg:h-[calc(100dvh-64px)]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <>
            <div className="flex flex-1 flex-col overflow-hidden">
              <SheetChatArea
                currentAgentType={specificAgent}
                isLoading={isLoading}
                // for mobile preview panel
                handlePreviewOpen={handlePreviewOpen}
              />
            </div>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="bg-card h-[80vh] max-h-[80vh] max-w-3xl overflow-hidden p-0">
                <SheetDataArea
                  isLoadings={isLoading}
                  sheetId={sheetId}
                  isMobile={isMobile}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-hidden md:grid-cols-2">
            <div className="border-border flex min-h-0 flex-col overflow-hidden border-r">
              <SheetChatArea
                currentAgentType={specificAgent}
                isLoading={isLoading}
              />
            </div>
            <div className="bg-card flex min-h-0 flex-col overflow-hidden">
              <SheetDataArea
                isLoadings={isLoading}
                sheetId={sheetId}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { default as FooterCta } from './SheetFooterCta';
