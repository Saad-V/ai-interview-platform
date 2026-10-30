import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowDownRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sessionHistoryService } from '../services/sessionHistoryService';

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? 'Could not load interview history.';
  }
  return error instanceof Error ? error.message : 'Could not load interview history.';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function SessionHistoryPage() {
  const historyQuery = useInfiniteQuery({
    queryKey: ['interview-history'],
    queryFn: ({ pageParam }) =>
      sessionHistoryService.listSessions({ cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
  });

  const sessions = historyQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 pb-20 pt-28 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="eyebrow text-text-muted">Your practice</p>
          <h1 className="editorial mt-3 text-5xl sm:text-6xl">Interview history</h1>
          <p className="mt-3 text-text-secondary">
            Pick up where you left off, or revisit feedback from a completed session.
          </p>
        </div>
        <Link className="primary-action" to="/setup">
          <Plus size={17} />
          New interview
        </Link>
      </header>

      {historyQuery.isLoading && (
        <p className="py-12 text-sm text-text-secondary" role="status">Loading your interviews…</p>
      )}

      {historyQuery.error && (
        <div className="mt-8 rounded-xl border border-border bg-surface p-5" role="alert">
          <p className="text-sm text-text-secondary">{getErrorMessage(historyQuery.error)}</p>
          <button
            className="text-link mt-3 text-sm"
            onClick={() => void historyQuery.refetch()}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {!historyQuery.isLoading && !historyQuery.error && sessions.length === 0 && (
        <section className="mt-10 rounded-xl border border-border bg-surface px-6 py-10 text-center">
          <h2 className="editorial text-3xl">Your first practice starts here.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Once you start an interview, this is where you can find its progress and feedback.
          </p>
          <Link className="primary-action mt-6" to="/setup">Start an interview</Link>
        </section>
      )}

      {sessions.length > 0 && (
        <section className="mt-8" aria-label="Interview sessions">
          <ul className="divide-y divide-border border-y border-border">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  className="group flex flex-wrap items-center justify-between gap-5 py-6 no-underline"
                  to={`/sessions/${session.id}`}
                >
                  <div className="min-w-0">
                    <p className="eyebrow text-text-muted">
                      {session.status.replaceAll('_', ' ')} · {session.difficulty}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">{formatDate(session.created_at)}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {session.turn_count} {session.turn_count === 1 ? 'answer' : 'answers'}
                      {' · '}{session.planned_duration_minutes} minutes
                    </p>
                    {session.report_preview && (
                      <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-text-secondary">
                        {session.report_preview.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {session.report_preview && (
                      <span className="mono text-sm">
                        {Math.round(session.report_preview.overall_score)} / 100
                      </span>
                    )}
                    <ArrowDownRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {historyQuery.hasNextPage && (
            <div className="mt-7 text-center">
              <button
                className="text-link text-sm"
                disabled={historyQuery.isFetchingNextPage}
                onClick={() => void historyQuery.fetchNextPage()}
                type="button"
              >
                {historyQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
