import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useInterview, useInterviewDispatch } from '../hooks/useInterview';
import { interviewService } from '../services/interviewService';
import type { QuestionResponse, InterviewReport, InterviewPhase } from '../types/interview';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import InterviewProgress from '../components/interview/InterviewProgress';
import StatusIndicator from '../components/interview/StatusIndicator';
import ReplayButton from '../components/interview/ReplayButton';
import SubmitButton from '../components/interview/SubmitButton';

export default function InterviewPage() {
  const navigate = useNavigate();
  const { sessionId } = useInterview();
  const dispatch = useInterviewDispatch();
  const hasBegun = useRef(false);

  // ── Data state ──
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);

  // ── Phase state machine ──
  const [phase, setPhase] = useState<InterviewPhase>('idle');

  // ── Hooks ──
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const {
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // ── Sync transcript into answer state ──
  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  // ── Speak the question when it arrives ──
  const speakQuestion = useCallback(
    (text: string) => {
      setPhase('speaking');
      speak(text, {
        onEnd: () => {
          setPhase('listening');
          startListening();
        },
      });
    },
    [speak, startListening]
  );

  // ── Begin interview — get first question ──
  useEffect(() => {
    if (!sessionId) {
      navigate('/setup');
      return;
    }

    if (hasBegun.current) return;
    hasBegun.current = true;

    let cancelled = false;

    const begin = async () => {
      try {
        const firstQuestion = await interviewService.beginInterview(sessionId);
        if (!cancelled) {
          setQuestion(firstQuestion);
          setTurnCount(firstQuestion.turn_number);
          setIsLoadingQuestion(false);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to start the interview.';
          setError(message);
          setIsLoadingQuestion(false);
        }
      }
    };

    begin();

    return () => {
      cancelled = true;
    };
  }, [sessionId, navigate]);

  // ── When question is set, speak it ──
  useEffect(() => {
    if (question && !isLoadingQuestion) {
      speakQuestion(question.question);
    }
  }, [question, isLoadingQuestion, speakQuestion]);

  // ── Submit answer ──
  const handleSubmit = async () => {
    if (!sessionId || !answer.trim()) return;

    stopListening();
    setPhase('thinking');
    setError(null);

    try {
      const response = await interviewService.submitAnswer(
        sessionId,
        answer.trim()
      );

      if (response.interview_completed && response.report) {
        dispatch({
          type: 'SET_REPORT',
          payload: response.report as InterviewReport,
        });
        navigate('/report');
      } else if (response.current_question) {
        // Reset for next question
        setAnswer('');
        resetTranscript();
        setQuestion(response.current_question);
        setTurnCount(response.current_question.turn_number);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit answer.';
      setError(message);
      setPhase('idle');
    }
  };

  // ── Replay the current question ──
  const handleReplay = () => {
    if (!question) return;
    stop();
    stopListening();
    speakQuestion(question.question);
  };



  // ── Loading state ──
  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="text-text-secondary font-medium">
            Starting your interview…
          </p>
          <p className="text-text-muted text-sm mt-1">
            Preparing your first question
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Fatal error (no question loaded) ──
  if (error && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-2xl card-bordered text-center"
        >
          <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-danger" />
          </div>
          <h2 className="text-xl font-bold mb-2">Could Not Start</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/setup')}
            className="px-6 py-3 btn-gradient rounded-xl transition-colors"
          >
            Back to Setup
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 pb-16 pt-28 sm:px-8">
      <InterviewProgress turnCount={turnCount} />
      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <p className="eyebrow text-text-muted">{question?.section_title || 'Interview'}</p>
          <div className="flex items-center gap-4">
            <p className="mono text-text-muted">QUESTION {String(turnCount).padStart(2, '0')} / 10</p>
            <StatusIndicator phase={phase} />
          </div>
        </div>

        <h1 className="editorial mt-10 text-4xl leading-tight sm:text-5xl">
          {question?.question}
        </h1>
        <label className="form-label mt-10" htmlFor="candidate-answer">Your answer</label>
        <textarea
          id="candidate-answer"
          className="form-control min-h-56 resize-y leading-7"
          placeholder="Take a moment to gather your thoughts, then write or speak your answer."
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={phase === 'thinking'}
        />
        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ReplayButton onReplay={handleReplay} disabled={isSpeaking || phase === 'thinking'} />
          <SubmitButton
            disabled={phase !== 'listening' || !answer.trim()}
            isSubmitting={phase === 'thinking'}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </main>
  );
}