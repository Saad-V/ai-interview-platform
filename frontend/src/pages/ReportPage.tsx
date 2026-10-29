import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useInterview, useInterviewDispatch } from '../hooks/useInterview';

export default function ReportPage() {
  const navigate = useNavigate();
  const { report } = useInterview();
  const dispatch = useInterviewDispatch();

  const handleNewInterview = () => {
    dispatch({ type: 'RESET' });
    navigate('/setup');
  };

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 pt-20">
        <section className="text-center">
          <p className="text-text-secondary">No report is available yet.</p>
          <button className="primary-action mt-5" onClick={handleNewInterview} type="button">
            Start an interview
          </button>
        </section>
      </main>
    );
  }

  const scores = [
    ['Technical', report.technical_score],
    ['Communication', report.communication_score],
  ] as const;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-28 sm:px-8">
      <header className="border-b border-border pb-8">
        <p className="eyebrow text-text-muted">Your interview report</p>
        <h1 className="editorial mt-5 text-5xl sm:text-6xl">A clear next step.</h1>
        <p className="mt-3 max-w-xl text-text-secondary">
          A considered look at what went well and where your next practice can make a difference.
        </p>
      </header>

      <section className="grid gap-8 border-b border-border py-9 sm:grid-cols-[1fr_1.2fr] sm:items-center">
        <div>
          <p className="eyebrow text-text-muted">Overall score</p>
          <p className="editorial mt-2 text-8xl leading-none">
            {Math.round(report.overall_score)}
            <span className="ml-2 text-3xl text-text-muted">/100</span>
          </p>
        </div>
        <div className="space-y-6">
          {scores.map(([label, score]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span>{label}</span>
                <span className="mono text-text-secondary">{Math.round(score)} / 100</span>
              </div>
              <div className="score-bar" aria-label={`${label} score ${score} out of 100`}>
                <span style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 border-b border-border py-9 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-text-muted">Strengths</p>
          <ul className="mt-4 space-y-3">
            {report.strengths.map((strength, index) => (
              <li className="border-t border-border pt-3 text-sm leading-6" key={`${index}-${strength}`}>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-text-muted">Improvements</p>
          <ul className="mt-4 space-y-3">
            {report.areas_for_improvement.map((area, index) => (
              <li className="border-t border-border pt-3 text-sm leading-6" key={`${index}-${area}`}>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 py-9 sm:grid-cols-2">
        <div>
          <p className="eyebrow text-text-muted">Hiring recommendation</p>
          <h2 className="editorial mt-3 text-3xl">{report.recommendation}</h2>
        </div>
        <div>
          <p className="eyebrow text-text-muted">Summary</p>
          <p className="mt-3 text-sm leading-7 text-text-secondary">{report.summary}</p>
        </div>
      </section>

      <div className="border-t border-border pt-7">
        <button className="primary-action" onClick={handleNewInterview} type="button">
          <RotateCcw size={16} />
          Start a new interview
        </button>
      </div>
    </main>
  );
}
