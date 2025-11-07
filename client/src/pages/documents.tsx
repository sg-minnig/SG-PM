import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  analyzed: boolean;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "2023-2024_Transition_Document.pdf",
      size: "2.4 MB",
      uploadedAt: new Date(2024, 10, 1),
      analyzed: true,
    },
    {
      id: "2",
      name: "Event_Timeline_Spring_2024.docx",
      size: "1.1 MB",
      uploadedAt: new Date(2024, 10, 15),
      analyzed: true,
    },
    {
      id: "3",
      name: "Budget_Handover_Notes.pdf",
      size: "856 KB",
      uploadedAt: new Date(2024, 11, 1),
      analyzed: false,
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.log("File dropped:", e.dataTransfer.files);
  };

  const handleAnalyze = (id: string) => {
    console.log("Analyzing document:", id);
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === id ? { ...doc, analyzed: true } : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">
          Documents
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload transition documents and let AI extract tasks
        </p>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="dropzone-upload"
      >
        <CardContent className="flex flex-col items-center justify-center min-h-64 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            Drop your documents here
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
            Upload transition documents, timelines, or handover notes. Our AI will
            analyze them and suggest relevant tasks.
          </p>
          <Button data-testid="button-upload">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Supports PDF, DOCX, TXT (Max 10MB)
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1" data-testid={`text-document-name-${doc.id}`}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{format(doc.uploadedAt, "MMM d, yyyy")}</span>
                    </div>
                    {doc.analyzed ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Analyzed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        onClick={() => handleAnalyze(doc.id)}
                        data-testid={`button-analyze-${doc.id}`}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Analyze with AI
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
