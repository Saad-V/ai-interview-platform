import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { useInterview, useInterviewDispatch } from '../hooks/useInterview';
import { interviewService } from '../services/interviewService';
import type { QuestionResponse, InterviewReport } from '../types/interview';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import InterviewProgress from '../components/interview/InterviewProgress';
import AIAvatar from '../components/interview/AIAvatar';
import StatusIndicator from '../components/interview/StatusIndicator';
import ReplayButton from '../components/interview/ReplayButton';
import SubmitButton from '../components/interview/SubmitButton';
import type { InterviewPhase } from '../components/interview/AIAvatar';

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
  const [showQuestion, setShowQuestion] = useState(false);

  // ── Hooks ──
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const {
    transcript,
    audioLevel,
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
      setShowQuestion(true);
      speak(text, {
        onEnd: () => {
          // Question fades out, auto-start listening
          setShowQuestion(false);
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

  // ── Main interview UI ──
  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ paddingTop: '80px' }}
    >
      {/* Progress */}
      <InterviewProgress turnCount={turnCount} />

      {/* AI Avatar — visual centerpiece */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        <AIAvatar phase={phase} audioLevel={audioLevel} />

        {/* Status */}
        <StatusIndicator phase={phase} />

        {/* Temporary question text — visible only during speaking */}
        <div className="max-w-xl w-full px-6 min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showQuestion && question && (
              <motion.p
                key={question.turn_number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center text-lg text-text-secondary leading-relaxed"
              >
                {question.question}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Temporary transcript text — visible only during listening */}
        <div className="max-w-xl w-full px-6 min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'listening' && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="w-full text-center p-4 bg-surface-elevated border border-border-subtle rounded-xl"
              >
                <p className="text-sm text-text-muted mb-2 font-medium">Your answer:</p>
                <p className="text-lg text-text-primary leading-relaxed min-h-[1.5rem]">
                  {answer || <span className="text-text-muted italic">Speak your answer...</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Non-fatal error toast */}
      <AnimatePresence>
        {error && question && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-3 mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 pb-10"
      >
        <ReplayButton
          onReplay={handleReplay}
          disabled={isSpeaking || phase === 'thinking'}
        />

        <SubmitButton
          disabled={phase !== 'listening' || !answer.trim()}
          isSubmitting={phase === 'thinking'}
          onSubmit={handleSubmit}
        />

      </motion.div>
    </div>
  );
}