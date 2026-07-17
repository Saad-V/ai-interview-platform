import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, ArrowRight } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import { useInterview } from '../hooks/useInterview';
import { interviewService } from '../services/interviewService';
import { AxiosError } from 'axios';

const PREPARATION_STEPS = [
  { label: 'Parsing Resume', description: 'Extracting key information...' },
  { label: 'Understanding Job Description', description: 'Analyzing requirements...' },
  { label: 'Building Candidate Profile', description: 'Creating your AI profile...' },
  { label: 'Building Job Profile', description: 'Mapping role expectations...' },
  { label: 'Generating Interview Blueprint', description: 'Crafting personalized questions...' },
  { label: 'Finalizing', description: 'Almost ready...' },
];

const STEP_INTERVAL_MS = 20_000;

export default function PreparingPage() {
  const navigate = useNavigate();
  const { sessionId } = useInterview();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate step progression only after starting
  useEffect(() => {
    if (hasStarted && !error) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= PREPARATION_STEPS.length - 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return PREPARATION_STEPS.length - 1;
          }
          return next;
        });
      }, STEP_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasStarted, error]);

  const handleStart = async () => {
    if (!sessionId || hasStarted) return;

    setHasStarted(true);
    setError(null);

    try {
      await interviewService.startPreparation(sessionId);

      // Finish the progress animation
      setCurrentStep(PREPARATION_STEPS.length - 1);

      // Let the user see the completed state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate("/interview");
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          setError("Interview preparation already started.");
        } else if (err.response?.status === 500) {
          setError("Something went wrong while preparing the interview.");
        } else {
          setError("Preparation failed. Please try again.");
        }
      } else {
        setError("Preparation failed. Please try again.");
      }
    }
  };

  if (error) {
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
          <h2 className="text-xl font-bold mb-2">Preparation Failed</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/setup')}
            className="px-6 py-3 btn-gradient rounded-xl transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-8 flex items-center justify-center section-glow" style={{ paddingTop: '140px' }}>
      {/* Subtle background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={hasStarted ? { rotate: 360 } : {}}
            transition={hasStarted ? { duration: 8, repeat: Infinity, ease: 'linear' } : {}}
            className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Brain className="w-7 h-7 text-primary" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {hasStarted ? (
              <>Preparing Your <span className="gradient-text">Interview</span></>
            ) : (
              <>Ready to <span className="gradient-text">Begin?</span></>
            )}
          </h1>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            {hasStarted
              ? "Our AI is analyzing your documents and crafting a personalized interview. This may take a couple of minutes."
              : "Click the button below to start generating your personalized interview questions."
            }
          </p>
        </motion.div>

        {!hasStarted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={handleStart}
              className="group flex items-center gap-3 px-8 py-4 btn-gradient rounded-xl text-lg transition-transform active:scale-95"
            >
              Start Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <StepProgress steps={PREPARATION_STEPS} currentStep={currentStep} />
        )}
      </div>
    </div>
  );
}
