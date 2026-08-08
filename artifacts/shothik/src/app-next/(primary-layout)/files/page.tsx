import { useState } from "react";
import { UploadCloud, File, FileText, Image as ImageIcon, Table as TableIcon, Presentation, Search, Filter, MoreVertical, Trash2, Download } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: "pdf" | "image" | "sheet" | "slides" | "markdown";
  size: string;
  date: string;
  source: "Uploaded" | "Chat" | "Twin";
}

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "Q3_Financials_v2.pdf", type: "pdf", size: "2.4 MB", date: "Today", source: "Uploaded" },
  { id: "2", name: "Competitor_Matrix_Analysis.xlsx", type: "sheet", size: "156 KB", date: "Yesterday", source: "Twin" },
  { id: "3", name: "Product_Roadmap_Draft.md", type: "markdown", size: "12 KB", date: "Oct 24, 2024", source: "Chat" },
  { id: "4", name: "Investor_Deck_Final.pptx", type: "slides", size: "5.1 MB", date: "Oct 22, 2024", source: "Twin" },
  { id: "5", name: "architecture_diagram.png", type: "image", size: "890 KB", date: "Oct 20, 2024", source: "Uploaded" },
  { id: "6", name: "User_Interview_Transcripts.pdf", type: "pdf", size: "4.2 MB", date: "Oct 18, 2024", source: "Uploaded" },
];

export default function FilesPage() {
  const [search, setSearch] = useState("");
  
  const filtered = MOCK_FILES.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Files</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Manage your uploaded documents, datasets, and AI-generated outputs.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors">
          <UploadCloud className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="px-8 pb-4 shrink-0 flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 bg-muted/50 border border-border px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20 mt-4">
            <UploadCloud className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground">Or click the upload button to select files.</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Size</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Date Modified</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(file => (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted border border-border shrink-0">
                        {file.type === "pdf" && <File className="w-4 h-4 text-red-500" />}
                        {file.type === "sheet" && <TableIcon className="w-4 h-4 text-emerald-500" />}
                        {file.type === "markdown" && <FileText className="w-4 h-4 text-brand" />}
                        {file.type === "slides" && <Presentation className="w-4 h-4 text-indigo-500" />}
                        {file.type === "image" && <ImageIcon className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span className="font-medium text-foreground truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{file.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        file.source === "Uploaded" ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" :
                        file.source === "Chat" ? "bg-brand/10 text-brand border-brand/20" :
                        "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                      }`}>
                        {file.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{file.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"><Download className="w-4 h-4" /></button>
                        <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}