"use client";

import { useRef, useState } from "react";

type ResumeProfile = {
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  skills?: string[];
  sections?: Record<string, unknown>;
};

type UploadResult = {
  filename: string;
  content_type: string;
  size_bytes?: number;
  text_length: number;
  text: string;
  profile?: ResumeProfile;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function formatSectionTitle(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSectionValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => formatSectionValue(item)).join("\n");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${formatSectionTitle(key)}: ${formatSectionValue(item)}`)
      .join("\n");
  }
  return String(value ?? "");
}

export default function ResumeUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  const selectFile = (candidate?: File) => {
    if (!candidate) return;
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
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
    setMessage("Extracting and structuring your resume…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const endpoint = `${API_URL}/api/v1/resumes/upload`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed.");
      setResult(data);
      setStatus("success");
      setMessage("Resume extracted and structured successfully.");
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
          {status === "uploading" ? "Analyzing…" : "Upload & analyze"} <span>→</span>
        </button>
      )}

      {message && <p className={`upload-message upload-${status}`}>{message}</p>}

      {result && (
        <div className="extraction-result">
          <div className="result-header">
            <div><span className="mini-label">RESUME INTELLIGENCE COMPLETE</span><strong>{result.text_length.toLocaleString()} characters analyzed</strong></div>
            <span className="result-check">✓ Ready</span>
          </div>

          {result.profile?.contact && (
            <div className="profile-block">
              <span className="mini-label">CONTACT</span>
              <div className="profile-contact">
                {result.profile.contact.name && <strong>{result.profile.contact.name}</strong>}
                {result.profile.contact.email && <span>{result.profile.contact.email}</span>}
                {result.profile.contact.phone && <span>{result.profile.contact.phone}</span>}
              </div>
            </div>
          )}

          {!!result.profile?.skills?.length && (
            <div className="profile-block">
              <span className="mini-label">DETECTED SKILLS</span>
              <div className="skill-list">
                {result.profile.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}
              </div>
            </div>
          )}

          {result.profile?.sections && Object.entries(result.profile.sections).map(([section, value]) => (
            <div className="profile-block" key={section}>
              <span className="mini-label">{formatSectionTitle(section)}</span>
              <div className="profile-section-text">{formatSectionValue(value)}</div>
            </div>
          ))}

          <details className="raw-evidence">
            <summary>View extracted evidence</summary>
            <div className="result-preview">{result.text.slice(0, 1800)}{result.text.length > 1800 ? "…" : ""}</div>
          </details>

          <p>Next, we’ll compare this profile against a target job description to calculate an explainable match and identify skill gaps.</p>
        </div>
      )}
    </div>
  );
}
