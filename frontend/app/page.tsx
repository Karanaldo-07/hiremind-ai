import ApiStatus from "./components/api-status";

const features = [
  {
    number: "01",
    title: "Resume Intelligence",
    text: "Turn your resume into structured skills, projects, experience and evidence.",
  },
  {
    number: "02",
    title: "Job Match",
    text: "Compare your profile with a job using explainable rules and semantic similarity.",
  },
  {
    number: "03",
    title: "Interview Agent",
    text: "Practice role-specific questions with adaptive follow-ups and useful feedback.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="HireMind AI home">
          <span className="brand-mark">H</span>
          <span>HireMind<span className="brand-accent"> AI</span></span>
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
        <a className="nav-cta" href="#start">Get started <span>→</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> AI-powered career intelligence</div>
          <h1>Know your fit.<br /><em>Own your interview.</em></h1>
          <p className="hero-text">
            HireMind turns your resume and a job description into a clear match analysis,
            personalized skill roadmap, and interview practice built around your actual profile.
          </p>
          <div className="hero-actions" id="start">
            <a className="button button-primary" href="#how-it-works">Analyze a job <span>→</span></a>
            <a className="button button-secondary" href="#features">Explore features</a>
          </div>
          <div className="trust-row">
            <span>Built for serious job seekers</span>
            <span className="dot" />
            <span>Explainable AI</span>
            <span className="dot" />
            <span>Portfolio-ready</span>
            <span className="dot" />
            <ApiStatus />
          </div>
        </div>

        <div className="hero-visual" aria-label="HireMind match analysis preview">
          <div className="glow glow-one" />
          <div className="glow glow-two" />
          <div className="dashboard-card">
            <div className="card-topline">
              <div>
                <span className="mini-label">JOB MATCH</span>
                <strong>AI Engineer</strong>
              </div>
              <span className="status">Analysis ready</span>
            </div>
            <div className="score-row">
              <div className="score-ring"><strong>82</strong><span>%</span></div>
              <div>
                <span className="match-title">Strong match</span>
                <p>Your profile aligns with most core requirements.</p>
              </div>
            </div>
            <div className="meter"><span /></div>
            <div className="stats">
              <div><b>18</b><span>matched skills</span></div>
              <div><b>4</b><span>skill gaps</span></div>
              <div><b>12</b><span>interview topics</span></div>
            </div>
            <div className="skill-list">
              <span className="skill good">Python ✓</span>
              <span className="skill good">SQL ✓</span>
              <span className="skill good">ML ✓</span>
              <span className="skill warn">AWS +</span>
              <span className="skill warn">Docker +</span>
            </div>
          </div>
          <div className="floating-card floating-top"><span>✦</span> Semantic matching</div>
          <div className="floating-card floating-bottom"><span>✓</span> Interview plan generated</div>
        </div>
      </section>

      <section className="how shell" id="how-it-works">
        <div className="section-heading">
          <span className="section-kicker">THE WORKFLOW</span>
          <h2>From application to interview,<br />one intelligent workspace.</h2>
        </div>
        <div className="feature-grid" id="features">
          {features.map((feature) => (
            <article className="feature" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="bottom-cta shell" id="about">
        <div>
          <span className="section-kicker">BUILT TO BE UNDERSTOOD</span>
          <h2>Not just an AI demo.<br />A project you can defend.</h2>
        </div>
        <p>Every score should be explainable. Every model should have an evaluation strategy. Every feature should teach you something you can discuss in an interview.</p>
      </section>

      <footer className="footer shell">
        <div className="brand"><span className="brand-mark">H</span><span>HireMind<span className="brand-accent"> AI</span></span></div>
        <span>AI-powered job intelligence & interview preparation.</span>
        <span>© 2026 HireMind AI</span>
      </footer>
    </main>
  );
}
