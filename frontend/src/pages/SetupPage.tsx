import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Clock,
  Gauge,
  ArrowRight,
  Loader2,
  AlertCircle,
  Play,
} from 'lucide-react';
import FileDropZone from '../components/FileDropZone';
import { useInterviewDispatch } from '../hooks/useInterview';
import { interviewService } from '../services/interviewService';
import { resumeService } from '../services/resumeService';
import { jobDescriptionService } from '../services/jobDescriptionService';
import { InterviewDifficulty, InterviewStatus } from '../types/interview';

const difficulties = [
  {
    value: InterviewDifficulty.EASY,
    label: 'Easy',
    description: 'Fundamentals & basics',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    activeBorder: 'border-success/50',
  },
  {
    value: InterviewDifficulty.MEDIUM,
    label: 'Medium',
    description: 'Intermediate concepts',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    activeBorder: 'border-warning/50',
  },
  {
    value: InterviewDifficulty.HARD,
    label: 'Hard',
    description: 'Advanced & in-depth',
    color: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    activeBorder: 'border-danger/50',
  },
];

const durationTicks = [
  { value: 10, label: '10m' },
  { value: 30, label: '30m' },
  { value: 60, label: '60m' },
  { value: 90, label: '90m' },
  { value: 120, label: '120m' },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const dispatch = useInterviewDispatch();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>(
    InterviewDifficulty.MEDIUM
  );
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = resumeFile && jdFile && duration >= 10 && duration <= 120;

  const handleStart = async () => {
    if (!resumeFile || !jdFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create session
      const session = await interviewService.createSession({
        planned_duration_minutes: duration,
        difficulty,
      });

      dispatch({
        type: 'SET_SESSION',
        payload: { sessionId: session.id, status: session.status as InterviewStatus },
      });

      // 2. Upload resume
      await resumeService.uploadResume(session.id, resumeFile);

      // 3. Upload job description
      await jobDescriptionService.uploadJobDescription(session.id, jdFile);

      // Navigate to preparing
      navigate('/preparing');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16" style={{ paddingTop: '140px', paddingLeft: '32px', paddingRight: '32px' }}>
      <div style={{ maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Set Up Your <span className="gradient-text">Interview</span>
          </h1>
          <p className="text-text-secondary">
            Upload your documents and configure the interview settings
          </p>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}
        >
          {/* Left column — Documents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Resume upload card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">Resume</h2>
                </div>
                <span className="badge badge-primary text-xs">Required</span>
              </div>
              <FileDropZone
                label=""
                file={resumeFile}
                onFileSelect={setResumeFile}
                onClear={() => setResumeFile(null)}
                disabled={isLoading}
              />
            </div>

            {/* JD upload card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">Job Description</h2>
                </div>
                <span className="badge badge-primary text-xs">Required</span>
              </div>
              <FileDropZone
                label=""
                file={jdFile}
                onFileSelect={setJdFile}
                onClear={() => setJdFile(null)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Right column — Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Difficulty card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Difficulty Level</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((d) => (
                  <motion.button
                    key={d.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDifficulty(d.value)}
                    disabled={isLoading}
                    className={`
                      p-4 rounded-xl border transition-all duration-200 text-center
                      ${difficulty === d.value
                        ? `${d.bg} ${d.activeBorder}`
                        : 'border-border-subtle bg-surface-elevated/30 hover:border-border'
                      }
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <p className={`text-sm font-semibold ${difficulty === d.value ? d.color : 'text-text-primary'}`}>
                      {d.label}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{d.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Duration card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Session Duration</h2>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-text-primary">{duration}</span>
                <span className="text-sm text-text-muted ml-1.5">Minutes</span>
              </div>

              <div className="mb-3">
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between">
                {durationTicks.map((tick) => (
                  <button
                    key={tick.value}
                    type="button"
                    onClick={() => setDuration(tick.value)}
                    disabled={isLoading}
                    className={`text-xs transition-colors ${
                      duration === tick.value
                        ? 'text-primary font-medium'
                        : 'text-text-muted hover:text-text-secondary'
                    } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {tick.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mt-6 rounded-xl bg-danger/10 border border-danger/30"
          >
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <motion.button
            whileHover={isValid && !isLoading ? { scale: 1.01 } : undefined}
            whileTap={isValid && !isLoading ? { scale: 0.98 } : undefined}
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className={`
              w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all duration-300
              ${isValid && !isLoading
                ? 'btn-gradient cursor-pointer'
                : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border-subtle'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up interview...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Interview
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
