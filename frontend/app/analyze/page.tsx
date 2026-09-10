import ResumeUpload from "../components/resume-upload";

export default function AnalyzePage() {
  return (
    <main className="analyze-page">
      <nav className="nav shell">
        <a className="brand" href="/" aria-label="HireMind AI home">
          <span className="brand-mark">H</span>
          <span>HireMind<span className="brand-accent"> AI</span></span>
        </a>
        <a className="nav-cta" href="/">Back home <span>←</span></a>
      </nav>

      <section className="analyze-hero shell">
        <div className="analyze-copy">
          <span className="section-kicker">STEP 01 · RESUME INTELLIGENCE</span>
          <h1>Start with your <em>resume.</em></h1>
          <p>
            Upload your current resume and HireMind will extract the evidence we need
            for skill matching, gap analysis, and personalized interview preparation.
          </p>
        </div>

        <ResumeUpload />
      </section>
    </main>
  );
}
