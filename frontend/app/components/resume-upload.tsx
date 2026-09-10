"use client";

import { useRef, useState } from "react";

type UploadResult = {
  filename: string;
  content_type: string;
  size_bytes: number;
  text_length: number;
  text: string;
};

export default function ResumeUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  const selectFile = (candidate?: File) => {
    if (!candidate) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(candidate.type)) {
      setFile(null);
      setStatus("error");
      setMessage("Please choose a PDF or DOCX resume.");
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setFile(null);
      setStatus("error");
      setMessage("Your resume must be 5 MB or smaller.");
      return;
    }
    setFile(candidate);
    setStatus("idle");
    setMessage("");
    setResult(null);
  };

  const upload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("Extracting your resume…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed.");
      setResult(data);
      setStatus("success");
      setMessage("Resume extracted successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <div className="upload-shell">
      <div
        className={`upload-zone ${dragging ? "upload-dragging" : ""} ${file ? "upload-selected" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <div className="upload-icon">↑</div>
        <strong>{file ? file.name : "Drop your resume here"}</strong>
        <span>{file ? "Click to choose a different file" : "or click to browse your files"}</span>
        <small>PDF or DOCX · Maximum 5 MB</small>
      </div>

      {file && status !== "success" && (
        <button className="button button-primary upload-button" onClick={(event) => { event.stopPropagation(); upload(); }} disabled={status === "uploading"}>
          {status === "uploading" ? "Analyzing…" : "Upload & extract"} <span>→</span>
        </button>
      )}

      {message && <p className={`upload-message upload-${status}`}>{message}</p>}

      {result && (
        <div className="extraction-result">
          <div className="result-header">
            <div><span className="mini-label">EXTRACTION COMPLETE</span><strong>{result.text_length.toLocaleString()} characters found</strong></div>
            <span className="result-check">✓ Ready</span>
          </div>
          <div className="result-preview">{result.text.slice(0, 900)}{result.text.length > 900 ? "…" : ""}</div>
          <p>Next, we’ll turn this raw evidence into structured skills, experience, projects, and education.</p>
        </div>
      )}
    </div>
  );
}
