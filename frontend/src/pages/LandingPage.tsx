import { ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const steps = [
  ['01', 'Bring your context', 'Add your resume and the Job Description you want to prepare for.'],
  ['02', 'Practice out loud', 'Work through a focused interview shaped around your experience.'],
  ['03', 'Learn what to improve', 'Get a clear report on what landed and where to go deeper.'],
];

const features = [
  ['Role-specific questions', 'Practice against the responsibilities and skills in the job description.'],
  ['A considered pace', 'Take the time you need to build thoughtful, complete answers.'],
  ['Useful feedback', 'See strengths and concrete opportunities to improve, not just a score.'],
  ['Private by design', 'Your documents and practice sessions stay in your account.'],
  ['Text Based', 'Respond naturally and review your answers as you go.'],
  ['Ready when you are', 'Return to practice whenever a new opportunity comes along.'],
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main>
      <section className="landing-shell hero">
        <div>
          <p className="eyebrow text-text-muted">A more thoughtful way to prepare</p>
          <h1 className="editorial hero-title">
            Rehearse the interview <em>before it counts.</em>
          </h1>
          <p className="hero-copy">
            Practice for the role you want with an interview built around your experience.
            Get clear feedback, then walk in ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button className="primary-action" onClick={() => navigate('/setup')} type="button">
              Start an interview <ArrowRight size={17} />
            </button>
            <a className="text-link" href="#sample-report">See a sample report</a>
          </div>
        </div>

        <aside className="preview-card" id="sample-report" aria-label="Sample interview question and evaluation">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow text-text-muted">Practice preview</p>
            <span className="mono text-text-muted">QUESTION 03</span>
          </div>
          <h2 className="editorial mt-8 text-3xl leading-tight">
            Tell me about a time you improved a process that wasn&apos;t working.
          </h2>
          <div className="preview-evaluation">
            <p className="eyebrow text-text-muted">AI evaluation</p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Your answer set a clear context and explained the change you made. Add a
              measurable result to make the impact more specific.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium">
              <Check size={16} aria-hidden="true" />
              <span>Strong structure</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="landing-shell landing-section" id="how-it-works">
        <p className="eyebrow text-text-muted">A simple process</p>
        <h2 className="editorial mt-3 text-4xl">How it works</h2>
        <div className="numbered-grid">
          {steps.map(([number, title, description]) => (
            <article key={number}>
              <p className="mono text-text-muted">{number}</p>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-shell landing-section">
        <div className="mb-8">
          <p className="eyebrow text-text-muted">Made for useful practice</p>
          <h2 className="editorial mt-3 text-4xl">Preparation with a point of view.</h2>
        </div>
        <div className="feature-grid">
          {features.map(([title, description]) => (
            <article key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-shell mt-24 border-t border-border py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary">
          <span>© {new Date().getFullYear()} AiiN</span>
          <div className="flex gap-5">
            <Link className="text-link" to="/login">Sign in</Link>
            <a className="text-link" href="#how-it-works">How it works</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
