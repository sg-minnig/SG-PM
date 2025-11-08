import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Sparkles, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document as DocType } from "@shared/schema";

interface TeamMember {
  position: string;
}

export default function Documents() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [documentName, setDocumentName] = useState<string>("");
  const [documentContent, setDocumentContent] = useState<string>("");
  const [useTextArea, setUseTextArea] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<DocType[]>({
    queryKey: ["/api/documents"],
  });

  // Fetch team members to get available positions
  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Get unique positions
  const positions = Array.from(new Set(teamMembers.map(m => m.position)));

  // Analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest(`/api/documents/${documentId}/analyze`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "AI Analysis Complete",
        description: "Tasks have been generated from the document",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to analyze document with AI",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest(`/api/documents/${documentId}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document Deleted",
        description: "Document has been removed",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete document",
      });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDocumentName(file.name);
      
      // Try to extract text from .txt files
      if (file.name.endsWith('.txt')) {
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setDocumentContent(text);
          };
          reader.readAsText(file);
        } catch (error) {
          console.warn("Could not extract text from file");
        }
      }
    }
  };

  const handleUpload = async () => {
    if (useTextArea) {
      // Manual paste mode
      if (!documentName || !documentContent || !selectedPosition) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please provide document name, content, and position",
        });
        return;
      }

      setIsUploading(true);

      try {
        // Create a dummy file for consistent storage
        const blob = new Blob([documentContent], { type: "text/plain" });
        const file = new File([blob], documentName, { type: "text/plain" });

        // Get presigned upload URL
        const uploadData = (await apiRequest(
          "/api/documents/upload-url",
          "POST",
          { filename: file.name }
        )) as unknown as { uploadURL: string; objectPath: string };
        const { uploadURL, objectPath } = uploadData;

        // Upload to object storage
        await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "text/plain",
          },
        });

        // Create document record
        await apiRequest("/api/documents", "POST", {
          name: documentName,
          position: selectedPosition,
          fileUrl: objectPath,
          content: documentContent,
          size: `${(new Blob([documentContent]).size / 1024).toFixed(2)} KB`,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        
        toast({
          title: "Upload Successful",
          description: "Document has been created",
        });

        setUploadDialogOpen(false);
        resetForm();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Failed to create document",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // File upload mode
      if (!selectedFile || !selectedPosition) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please select a file and position",
        });
        return;
      }

      setIsUploading(true);

      try {
        // Get presigned upload URL
        const uploadData = (await apiRequest(
          "/api/documents/upload-url",
          "POST",
          { filename: selectedFile.name }
        )) as unknown as { uploadURL: string; objectPath: string };
        const { uploadURL, objectPath } = uploadData;

        // Upload file to object storage
        await fetch(uploadURL, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type || "text/plain",
          },
        });

        // Create document record
        await apiRequest("/api/documents", "POST", {
          name: selectedFile.name,
          position: selectedPosition,
          fileUrl: objectPath,
          content: documentContent || "",
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        
        toast({
          title: "Upload Successful",
          description: "Document has been uploaded",
        });

        setUploadDialogOpen(false);
        resetForm();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Failed to upload document",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedPosition("");
    setDocumentName("");
    setDocumentContent("");
    setUseTextArea(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight" data-testid="text-page-title">
            Documents
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload transition documents and let AI generate role-specific tasks
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Transition Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="position">Role/Position</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger id="position" data-testid="select-position">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This document will generate tasks for people in this role
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={!useTextArea ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseTextArea(false)}
                    className="flex-1"
                  >
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={useTextArea ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseTextArea(true)}
                    className="flex-1"
                  >
                    Paste Content
                  </Button>
                </div>

                {useTextArea ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="doc-name">Document Name</Label>
                      <Input
                        id="doc-name"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="e.g., President Transition Notes.txt"
                        data-testid="input-document-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-content">Document Content</Label>
                      <Textarea
                        id="doc-content"
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        placeholder="Paste your transition document text here..."
                        rows={8}
                        data-testid="textarea-document-content"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the full text of your transition document
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="file">Document File</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="file"
                          type="file"
                          accept=".txt"
                          onChange={handleFileSelect}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          data-testid="input-file"
                        />
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Only .txt files supported (content will be extracted automatically)
                      </p>
                    </div>
                    {documentContent && (
                      <div className="space-y-2">
                        <Label>Extracted Content Preview</Label>
                        <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                          <p className="text-xs font-mono whitespace-pre-wrap">
                            {documentContent.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  !selectedPosition ||
                  (useTextArea ? (!documentName || !documentContent) : !selectedFile)
                }
                className="w-full"
                data-testid="button-confirm-upload"
              >
                {isUploading ? "Uploading..." : useTextArea ? "Create Document" : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Uploaded Documents</h2>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center min-h-72 p-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No documents yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Upload transition documents and our AI will analyze them to generate role-specific tasks
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-0 shadow-sm hover-elevate" data-testid={`card-document-${doc.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1" data-testid={`text-document-name-${doc.id}`}>
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.position}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt ? format(new Date(doc.uploadedAt), "MMM d, yyyy") : "N/A"}</span>
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
                          className="w-full mb-2"
                          onClick={() => analyzeMutation.mutate(doc.id)}
                          disabled={analyzeMutation.isPending}
                          data-testid={`button-analyze-${doc.id}`}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {analyzeMutation.isPending ? "Analyzing..." : "Analyze with AI"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${doc.id}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
