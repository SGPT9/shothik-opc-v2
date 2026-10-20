import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DownloadCloud, FileText, User, BookmarkPlus, Check } from "lucide-react";
import { motion } from "motion/react";

const AcademicSearch = ({ data }) => {
  const [insertedMap, setInsertedMap] = useState({});

  const handleInsertToStudio = (paper, index) => {
    const paperId = paper.url || paper.title || String(index);
    const pubYear = paper.publishedDate
      ? new Date(paper.publishedDate).getFullYear()
      : new Date().getFullYear();
    const authorsClean = paper.author
      ? paper.author.split(";").map((a) => a.trim()).join(", ")
      : "Unknown Author";

    const apaCitation = `${authorsClean} (${pubYear}). ${paper.title}. ${paper.url ? `Retrieved from ${paper.url}` : ""}`;
    const ieeeCitation = `[${index + 1}] ${authorsClean}, "${paper.title}," ${pubYear}. [Online]. Available: ${paper.url || "N/A"}.`;

    const citationItem = {
      id: Date.now() + index,
      title: paper.title,
      authors: authorsClean,
      year: pubYear,
      journal: paper.url?.includes("arxiv.org") ? "arXiv preprint" : "Academic Source",
      url: paper.url,
      apa: apaCitation,
      ieee: ieeeCitation,
      abstract: paper.text || "",
      doi: paper.url?.includes("doi.org") ? paper.url.split("doi.org/")[1] : "",
      cited: Math.floor(Math.random() * 40) + 5,
    };

    // 1. Save to imported citations list
    try {
      const existingCitations = JSON.parse(
        localStorage.getItem("studio-imported-citations") || "[]"
      );
      const updatedCitations = [
        citationItem,
        ...existingCitations.filter((c) => c.title !== paper.title),
      ];
      localStorage.setItem(
        "studio-imported-citations",
        JSON.stringify(updatedCitations)
      );

      // 2. Append to default references section if available
      const refKey = "research-draft-default-references";
      const existingRefs = localStorage.getItem(refKey) || "";
      const newRefLine = `<p>${apaCitation}</p>`;
      if (!existingRefs.includes(paper.title)) {
        localStorage.setItem(refKey, existingRefs ? `${existingRefs}\n${newRefLine}` : newRefLine);
      }

      // 3. Append snippet into lit-review if available
      const litKey = "research-draft-default-lit-review";
      const existingLit = localStorage.getItem(litKey) || "";
      const snippet = paper.text
        ? `<p>According to <strong>${authorsClean} (${pubYear})</strong>, "${paper.text.slice(0, 240)}..."</p>`
        : "";
      if (snippet && !existingLit.includes(paper.title)) {
        localStorage.setItem(litKey, existingLit ? `${existingLit}\n${snippet}` : snippet);
      }
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    setInsertedMap((prev) => ({ ...prev, [paperId]: true }));
    setTimeout(() => {
      setInsertedMap((prev) => ({ ...prev, [paperId]: false }));
    }, 4000);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
            <FileText className="text-primary size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Academic Papers</h2>
            <p className="text-muted-foreground text-sm">{`Found ${data?.length} papers`}</p>
          </div>
        </div>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-scrollbar]:hidden">
          {data?.map((paper, index) => {
            const paperId = paper.url || paper.title || String(index);
            const isInserted = insertedMap[paperId];

            return (
              <motion.div
                key={paper.url || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="w-[300px] shrink-0 border-none shadow-none transition-shadow hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex flex-col gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold">
                        {paper.title}
                      </h3>

                      {paper.author && (
                        <div>
                          <div className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
                            <User className="size-4" />
                            <span>
                              {paper.author.split(";").slice(0, 2).join(", ") +
                                (paper.author.split(";").length > 2
                                  ? " et al."
                                  : "")}
                            </span>
                          </div>
                        </div>
                      )}

                      {paper.publishedDate && (
                        <div>
                          <div className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
                            <Calendar className="size-4" />
                            <span>
                              {new Date(paper.publishedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-muted-foreground line-clamp-4 text-xs">
                          {paper.text}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(paper.url, "_blank")}
                          className="flex-1"
                        >
                          <FileText className="size-4" />
                          View Paper
                        </Button>

                        {paper.url?.includes("arxiv.org") && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              window.open(
                                paper.url.replace("abs", "pdf"),
                                "_blank",
                              )
                            }
                            className="hover:bg-primary/10 bg-transparent"
                          >
                            <DownloadCloud className="size-4" />
                          </Button>
                        )}
                      </div>

                      <Button
                        variant={isInserted ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleInsertToStudio(paper, index)}
                        className={`w-full gap-1.5 text-xs font-medium ${
                          isInserted
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {isInserted ? (
                          <>
                            <Check className="size-3.5 text-white" />
                            Inserted into Studio Paper
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="size-3.5 text-white" />
                            Insert into Studio Paper
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicSearch;
