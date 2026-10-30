import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { sessionHistoryService } from '../services/sessionHistoryService';

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === 'object' && 'detail' in data) {
      const { detail } = data;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => item && typeof item === 'object' && 'msg' in item ? item.msg : null)
          .filter((message): message is string => typeof message === 'string');
        if (messages.length > 0) return messages.join(' ');
      }
    }
    return error.response
      ? `Request failed (${error.response.status}).`
      : error.message || 'Could not reach the server.';
  }
  return error instanceof Error ? error.message : 'Could not load this interview.';
}

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const sessionQuery = useQuery({
    queryKey: ['interview-history', sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required.');
      return sessionHistoryService.getSession(sessionId);
    },
    enabled: Boolean(sessionId),
  });
  const turnsQuery = useQuery({
    queryKey: ['interview-history', sessionId, 'turns'],
    queryFn: () => {
      if (!sessionId) throw new Error('Session ID is required.');
      return sessionHistoryService.getTurns(sessionId);
    },
    enabled: Boolean(sessionId),
  });

  if (sessionQuery.isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-5 pt-32 sm:px-8">
        <p className="text-sm text-text-secondary" role="status">Loading interview details…</p>
      </main>
    );
  }

  if (sessionQuery.error || !sessionQuery.data) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-5 pt-32 sm:px-8">
        <p className="text-sm text-text-secondary" role="alert">
          {sessionQuery.error ? getErrorMessage(sessionQuery.error) : 'Interview details are unavailable.'}
        </p>
        <button
          className="text-link mt-4 inline-block text-sm"
          onClick={() => void sessionQuery.refetch()}
          type="button"
        >
          Try again
        </button>
        <Link className="text-link mt-4 inline-block text-sm" to="/sessions">
          Back to interview history
        </Link>
      </main>
    );
  }

  const session = sessionQuery.data;
  const turns = turnsQuery.data ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 pb-20 pt-28 sm:px-8">
      <Link className="text-link text-sm" to="/sessions">← Interview history</Link>
      <header className="mt-7 border-b border-border pb-8">
        <p className="eyebrow text-text-muted">
          {session.status.replaceAll('_', ' ')} · {session.difficulty}
        </p>
        <h1 className="editorial mt-3 text-5xl sm:text-6xl">Session summary</h1>
        <p className="mt-3 text-sm text-text-secondary">
          {new Intl.DateTimeFormat(undefined, {
            dateStyle: 'full',
            timeStyle: 'short',
          }).format(new Date(session.created_at))}
          {' · '}{session.planned_duration_minutes} minutes
          {' · '}{session.turn_count} {session.turn_count === 1 ? 'answer' : 'answers'}
        </p>
      </header>

      {session.report ? (
        <>
          <section className="grid gap-8 border-b border-border py-8 sm:grid-cols-[0.7fr_1.3fr] sm:items-center">
            <div>
              <p className="eyebrow text-text-muted">Overall score</p>
              <p className="editorial mt-2 text-7xl">
                {session.report.overall_score === null ? '—' : Math.round(session.report.overall_score)}
                <span className="ml-2 text-2xl text-text-muted">/100</span>
              </p>
            </div>
            <div>
              <p className="eyebrow text-text-muted">Summary</p>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{session.report.summary}</p>
              <p className="mt-4 text-sm">
                <span className="text-text-muted">Recommendation: </span>
                {session.report.recommendation}
              </p>
            </div>
          </section>

          <section className="grid gap-8 border-b border-border py-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow text-text-muted">Strengths</p>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {session.report.strengths.map((strength, index) => (
                  <li className="border-t border-border pt-2" key={`${index}-${strength}`}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-text-muted">Areas to improve</p>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {session.report.areas_for_improvement.map((area, index) => (
                  <li className="border-t border-border pt-2" key={`${index}-${area}`}>{area}</li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : (
        <section className="border-b border-border py-7">
          <p className="text-sm text-text-secondary">
            A final report is not available for this session yet.
          </p>
        </section>
      )}

      <section className="py-8">
        <p className="eyebrow text-text-muted">Questions and feedback</p>
        {turnsQuery.isLoading ? (
          <p className="mt-4 text-sm text-text-secondary" role="status">Loading answers…</p>
        ) : turnsQuery.error ? (
          <div className="mt-4" role="alert">
            <p className="text-sm text-text-secondary">{getErrorMessage(turnsQuery.error)}</p>
            <button
              className="text-link mt-3 text-sm"
              onClick={() => void turnsQuery.refetch()}
              type="button"
            >
              Retry loading answers
            </button>
          </div>
        ) : turns.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">No submitted answers are available.</p>
        ) : (
          <ol className="mt-4 divide-y divide-border border-y border-border">
            {turns.map((turn) => (
              <li className="py-6" key={turn.id}>
                <p className="mono text-text-muted">
                  QUESTION {String(turn.turn_number).padStart(2, '0')} · {turn.section_title}
                </p>
                <h2 className="editorial mt-3 text-3xl">{turn.question}</h2>
                <div className="mt-5">
                  <p className="eyebrow text-text-muted">Your answer</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                    {turn.candidate_answer}
                  </p>
                </div>

                {turn.evaluation && (
                  <details className="mt-5 border-t border-border pt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      View evaluation
                      {turn.evaluation.awarded_score !== null && turn.evaluation.maximum_score !== null
                        ? ` · ${turn.evaluation.awarded_score} / ${turn.evaluation.maximum_score}`
                        : turn.evaluation.score !== null
                          ? ` · Score ${turn.evaluation.score}`
                          : ''}
                    </summary>
                    <div className="mt-4 space-y-5">
                      <p className="text-sm leading-7 text-text-secondary">{turn.evaluation.feedback}</p>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <p className="eyebrow text-text-muted">Strengths</p>
                          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                            {turn.evaluation.strengths.map((item, index) => (
                              <li key={`${index}-${item}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow text-text-muted">Areas to improve</p>
                          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                            {turn.evaluation.weaknesses.map((item, index) => (
                              <li key={`${index}-${item}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {turn.evaluation.missing_topics.length > 0 && (
                        <p className="text-sm text-text-secondary">
                          <span className="font-medium text-text-primary">Topics to cover: </span>
                          {turn.evaluation.missing_topics.join(', ')}
                        </p>
                      )}
                      <p className="text-sm leading-6 text-text-secondary">
                        <span className="font-medium text-text-primary">Suggested improvement: </span>
                        {turn.evaluation.suggested_improvement}
                      </p>
                      {(turn.evaluation.technical_percentage !== null
                        || turn.evaluation.communication_percentage !== null) && (
                        <p className="mono text-text-muted">
                          {turn.evaluation.technical_percentage !== null
                            ? `Technical ${Math.round(turn.evaluation.technical_percentage)}%`
                            : ''}
                          {turn.evaluation.technical_percentage !== null
                            && turn.evaluation.communication_percentage !== null
                            ? ' · '
                            : ''}
                          {turn.evaluation.communication_percentage !== null
                            ? `Communication ${Math.round(turn.evaluation.communication_percentage)}%`
                            : ''}
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
