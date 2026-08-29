
import NotFound from "@/app-next/not-found";
import { Redirect } from "wouter";
import { AgentContextProvider } from "@/components/agents/shared/AgentContextProvider";
import ChatAgentPage from "@/components/agents/ChatAgentPage";
import ChatInput from "@/components/research/ui/ChatInput";
import ResearchPageSkeletonLoader from "@/components/research/ui/ResearchPageSkeletonLoader";
import { FooterCta } from "@/components/sheet/SheetAgentPage"; // Needs to move it to common or shared folder.
import { researchCoreState } from "@/redux/slices/researchCoreSlice";

import { lazy } from "react";
import { useParams, useSearchParams } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import PresentationAgentPage from "@/components/presentation/PresentationAgentPage";
// import ResearchAgentPage from "@/components/research/ResearchAgentPage";
// const PresentationAgentPage = dynamic(
//   () => import("@/components/presentation/PresentationAgentPage"),
//   {
//     loading: () => <ResearchPageSkeletonLoader />,
//     ssr: false,
//   },
// );
const PresentationAgentPageV2 = lazy(() => import("@/components/presentation/PresentationAgentPageV2"));
const SheetAgentPage = lazy(() => import("@/components/sheet/SheetAgentPage"));
const ResearchAgentPage = lazy(() => import("@/components/research/ResearchAgentPage"));

export default function SpecificAgentPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const agentType = params.agentType;

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const researchId = searchParams.get("r_id"); // this ID is presents when we are on research simulation mode
  const isResarchSimulating = !!researchId;

  // 

  const [loadingResearchHistory, setLoadingResearchHistory] = useState(true);

  const { isSimulating, simulationStatus } = useSelector(researchCoreState);

  // Media query hook for responsive design
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  // Function to render the appropriate component based on agentType
  const renderComponent = () => {
    switch (agentType) {
      case "chat":
        return <ChatAgentPage />;
      case "presentation":
      case "slides":
        return <PresentationAgentPageV2 />;
      case "sheet":
      case "sheets":
        return <SheetAgentPage specificAgent="sheet" />;
      case "research":
        return <ResearchAgentPage />;
      case "browse":
        return <Redirect to="/marketplace" replace />;
      case "call":
        return <Redirect to="/twin?tab=video" replace />;
      default:
        return <NotFound />;
    }
  };

  return (
    <AgentContextProvider>
      <div className="relative min-h-[calc(100dvh-200px)] overflow-y-auto">
        {renderComponent()}

        {/* chat input for research agents */}
        {agentType === "research" && !isResarchSimulating && (
          <>
            {!loadingResearchHistory && (
              <div className="absolute bottom-[0.7rem] left-0 w-full px-2 sm:px-0">
                <ChatInput />
              </div>
            )}
          </>
        )}

        {/* join the beta list footer cta for research only now */}
        {!isSimulating && simulationStatus === "completed" && (
          <div className="absolute bottom-0 flex w-full items-center justify-center">
            <FooterCta
              isMobile={isMobile}
              showModal={showModal}
              setShowModal={setShowModal}
            />
          </div>
        )}
      </div>
    </AgentContextProvider>
  );
}
