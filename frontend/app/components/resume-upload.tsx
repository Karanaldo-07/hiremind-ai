"use client";

import { useRef, useState } from "react";

type ResumeProfile = {
  contact?: { name?: string; email?: string; phone?: string; linkedin?: string };
  skills?: string[];
  sections?: Record<string, unknown>;
};

type UploadResult = {
  filename: string;
  content_type: string;
  text_length: number;
  text: string;
  profile?: ResumeProfile;
};

type MatchResult = {
  match_score: number;
  score_breakdown: { skills: number; semantic: number; experience: number; education: number };
  matched_skills: string[];
  missing_skills: string[];
  job_title?: string | null;
  experience: { resume_years?: number | null; required_years?: number | null; reason: string };
  education: { resume_degrees: string[]; required_degrees: string[]; reason: string };
  semantic_analysis?: { score: number; similarity: number; method: string };
  methodology: string;
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
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [matching, setMatching] = useState(false);

  const selectFile = (candidate?: File) => {
    if (!candidate) return;
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(candidate.type)) {
      setFile(null); setStatus("error"); setMessage("Please choose a PDF or DOCX resume."); return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setFile(null); setStatus("error"); setMessage("Your resume must be 5 MB or smaller."); return;
    }
    setFile(candidate); setStatus("idle"); setMessage(""); setResult(null); setMatch(null);
  };

  const upload = async () => {
    if (!file) return;
    setStatus("uploading"); setMessage("Extracting and structuring your resume…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/api/v1/resumes/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed.");
      setResult(data); setStatus("success"); setMessage("Resume extracted and structured successfully.");
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  const analyzeMatch = async () => {
    if (!result || jobDescription.trim().length < 30) return;
    setMatching(true); setMatch(null); setMessage("Comparing your resume using skills, experience, and lightweight ML similarity…");
    try {
      const response = await fetch(`${API_URL}/api/v1/matches/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: result.text,
          resume_skills: result.profile?.skills || [],
          job_description: jobDescription,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Match analysis failed.");
      setMatch(data.match); setMessage("Hybrid match analysis complete.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setMatching(false);
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
        <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(event) => selectFile(event.target.files?.[0])} />
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
              <div className="skill-list">{result.profile.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div>
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
        </div>
      )}

      {result && !match && (
        <section className="job-match-panel">
          <div>
            <span className="section-kicker">STEP 02 · JOB INTELLIGENCE</span>
            <h2>Now test your <em>fit.</em></h2>
            <p>Paste a real job description. HireMind will compare it with the skills and evidence extracted from your resume.</p>
          </div>
          <textarea
            className="job-input"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the complete job description here…"
            maxLength={30000}
          />
          <div className="job-input-footer">
            <span>{jobDescription.length.toLocaleString()} characters · minimum 30</span>
            <button className="button button-primary" onClick={analyzeMatch} disabled={matching || jobDescription.trim().length < 30}>
              {matching ? "Calculating…" : "Analyze my fit"} <span>→</span>
            </button>
          </div>
        </section>
      )}

      {match && (
        <section className="match-result">
          <div className="match-result-top">
            <div>
              <span className="section-kicker">STEP 03 · HYBRID MATCH</span>
              <h2>{match.job_title || "Target role"}</h2>
              <p>HireMind combines exact skill evidence with ML-based text relevance to explain your fit.</p>
            </div>
            <div className="big-score"><strong>{match.match_score}</strong><span>%</span></div>
          </div>

          <div className="breakdown-grid">
            <div><span>SKILLS</span><strong>{match.score_breakdown.skills}%</strong></div>
            <div><span>RELEVANCE</span><strong>{match.score_breakdown.semantic}%</strong></div>
            <div><span>EXPERIENCE</span><strong>{match.score_breakdown.experience}%</strong></div>
            <div><span>EDUCATION</span><strong>{match.score_breakdown.education}%</strong></div>
          </div>

          <div className="semantic-note">
            <div><span className="mini-label">TEXT RELEVANCE</span><strong>{match.score_breakdown.semantic}%</strong></div>
            <p>{match.semantic_analysis?.method || "TF-IDF word + bi-gram cosine similarity"}</p>
          </div>

          <div className="match-columns">
            <div><span className="mini-label">MATCHED SKILLS</span><div className="skill-list">{match.matched_skills.map((skill) => <span className="skill good" key={skill}>✓ {skill}</span>)}</div></div>
            <div><span className="mini-label">SKILL GAPS</span><div className="skill-list">{match.missing_skills.length ? match.missing_skills.map((skill) => <span className="skill warn" key={skill}>+ {skill}</span>) : <span className="match-positive">No detected skill gaps.</span>}</div></div>
          </div>

          <div className="fit-reasons">
            <p><strong>Experience:</strong> {match.experience.reason}</p>
            <p><strong>Education:</strong> {match.education.reason}</p>
          </div>
          <p className="methodology">Scoring methodology: {match.methodology}</p>
        </section>
      )}
    </div>
  );
}
