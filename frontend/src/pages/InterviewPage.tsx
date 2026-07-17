import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  Loader2,
  MessageSquare,
  Hash,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useInterview, useInterviewDispatch } from '../hooks/useInterview';
import { interviewService } from '../services/interviewService';
import type { QuestionResponse, InterviewReport } from '../types/interview';

console.log("InterviewPage rendered");
export default function InterviewPage() {
  const navigate = useNavigate();
  const { sessionId } = useInterview();
  const dispatch = useInterviewDispatch();
  const hasBegun = useRef(false);
  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);

  // Begin interview — get first question
  useEffect(() => {
    console.log("InterviewPage rendered");

    if (!sessionId) {
      navigate("/setup");
      return;
    }


    if (hasBegun.current) return;

    hasBegun.current = true;

    let cancelled = false;

    const begin = async () => {
      console.log("Calling /begin API");
      try {
        const firstQuestion =
          await interviewService.beginInterview(sessionId);

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
              : "Failed to start the interview.";

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

  const handleSubmit = async () => {
    if (!sessionId || !answer.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await interviewService.submitAnswer(sessionId, answer.trim());

      if (response.interview_completed && response.report) {
        // Interview is done — save report and navigate
        dispatch({ type: 'SET_REPORT', payload: response.report as InterviewReport });
        navigate('/report');
      } else if (response.current_question) {
        // Next question
        setQuestion(response.current_question);
        setTurnCount(response.current_question.turn_number);
        setAnswer('');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit answer.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isSubmitting && answer.trim()) {
      handleSubmit();
    }
  };

  // Loading state
  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen pb-12 px-8 flex items-center justify-center" style={{ paddingTop: '140px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="text-text-secondary font-medium">Starting your interview...</p>
          <p className="text-text-muted text-sm mt-1">Preparing your first question</p>
        </motion.div>
      </div>
    );
  }

  // Error state with no question
  if (error && !question) {
    return (
      <div className="min-h-screen pb-12 px-8 flex items-center justify-center" style={{ paddingTop: '140px' }}>
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
    <div className="min-h-screen pb-12 px-8" style={{ paddingTop: '100px' }}>
      {/* Top progress bar */}
      <div className="fixed top-[57px] left-0 right-0 h-0.5 bg-surface-elevated z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(turnCount * 10, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="max-w-3xl mx-auto pt-4">
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="badge badge-primary">
              <Hash className="w-3.5 h-3.5" />
              <span>Question {turnCount}</span>
            </div>
          </div>
          {question && (
            <div className="badge badge-surface">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{question.section_title}</span>
            </div>
          )}
        </motion.div>

        {/* Question Card */}
        {question && (
          <motion.div
            key={question.turn_number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card p-8 mb-8"
            style={{
              borderLeft: '3px solid var(--color-primary)',
            }}
          >
            {/* Section title */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/15 mb-5">
              <span className="text-xs font-medium text-accent">
                {question.section_title}
              </span>
            </div>

            {/* Question text */}
            <p className="text-lg md:text-xl font-medium text-text-primary leading-relaxed">
              {question.question}
            </p>
          </motion.div>
        )}

        {/* Answer area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Response label */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-text-secondary">Your Response</span>
          </div>

          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Type your answer here..."
              rows={8}
              className="w-full p-6 rounded-xl bg-surface border border-border-subtle text-text-primary placeholder-text-muted resize-none transition-all duration-300 disabled:opacity-50"
            />

            {/* Character count */}
            <div className="absolute bottom-4 left-6 text-xs text-text-muted">
              {answer.length} characters
            </div>
          </div>

          {/* Error inline */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 mt-4 rounded-xl bg-danger/10 border border-danger/30"
            >
              <AlertCircle className="w-4 h-4 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-text-muted">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle text-text-secondary text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle text-text-secondary text-xs">Enter</kbd> to submit
            </p>

            <motion.button
              whileHover={!isSubmitting && answer.trim() ? { scale: 1.03 } : undefined}
              whileTap={!isSubmitting && answer.trim() ? { scale: 0.97 } : undefined}
              onClick={handleSubmit}
              disabled={isSubmitting || !answer.trim()}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${!isSubmitting && answer.trim()
                  ? 'btn-gradient cursor-pointer'
                  : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border-subtle'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  Submit Answer
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
