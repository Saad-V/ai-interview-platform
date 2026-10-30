import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  History,
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
    activeClass: 'active-easy',
  },
  {
    value: InterviewDifficulty.MEDIUM,
    label: 'Medium',
    description: 'Intermediate concepts',
    activeClass: 'active-medium',
  },
  {
    value: InterviewDifficulty.HARD,
    label: 'Hard',
    description: 'Advanced & in-depth',
    activeClass: 'active-hard',
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
    <div className="min-h-screen pb-20" style={{ paddingTop: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow text-text-muted">Start with the context</p>
              <h1 className="editorial mt-3 text-5xl md:text-6xl">
                Set up your interview
              </h1>
              <p className="mt-3 max-w-xl text-text-secondary">
                Add your resume and the job description. We&apos;ll shape a practice session around both.
              </p>
            </div>
            <Link
              className="text-link inline-flex items-center gap-2 text-sm"
              to="/sessions"
            >
              <History className="h-4 w-4" aria-hidden="true" />
              View past interviews and reports
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="space-y-8"
        >
          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="mb-6">
              <p className="eyebrow text-text-muted">01 — Your materials</p>
              <h2 className="editorial mt-2 text-3xl">Two documents, one tailored interview.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resume */}
              <div className="card p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">Resume <span className="text-text-muted">· Required</span></h3>
                <FileDropZone
                  label="Upload your resume"
                  file={resumeFile}
                  onFileSelect={setResumeFile}
                  onClear={() => setResumeFile(null)}
                  disabled={isLoading}
                />
              </div>

              {/* Job Description */}
              <div className="card p-6">
                <h3 className="mb-4 text-sm font-semibold text-text-primary">Job description <span className="text-text-muted">· Required</span></h3>
                <FileDropZone
                  label="Upload the role description"
                  file={jdFile}
                  onFileSelect={setJdFile}
                  onClear={() => setJdFile(null)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="mb-6">
              <p className="eyebrow text-text-muted">02 — Your session</p>
              <h2 className="editorial mt-2 text-3xl">Choose how you want to practice.</h2>
            </div>

            <div className="space-y-8">
              {/* Difficulty Level */}
              <div className="card p-8">
                <h3 className="text-lg font-semibold text-text-primary mb-6">Difficulty Level</h3>
                <div className="grid grid-cols-3 gap-4">
                  {difficulties.map((d) => (
                    <motion.button
                      key={d.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty(d.value)}
                      disabled={isLoading}
                      className={`
                        difficulty-btn
                        ${difficulty === d.value ? `active ${d.activeClass}` : ''}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <p className="text-sm font-semibold text-text-primary">
                        {d.label}
                      </p>
                      <p className="text-xs text-text-muted mt-2">{d.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="card p-8">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">Session Duration</h3>
                  </div>
                  <div className="text-right">
                    <span className="mono text-3xl font-medium text-text-primary">
                      {duration}
                    </span>
                    <span className="text-sm text-text-muted ml-2">minutes</span>
                  </div>
                </div>

                <div className="mb-8">
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={isLoading}
                    style={{ '--value': Math.round(((duration - 10) / 110) * 100) } as React.CSSProperties}
                  />
                </div>

                <div className="flex justify-between px-1">
                  {durationTicks.map((tick) => (
                    <motion.button
                      key={tick.value}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDuration(tick.value)}
                      disabled={isLoading}
                      className={`
                        text-xs font-medium transition-all
                        ${
                          duration === tick.value
                            ? 'text-primary'
                            : 'text-text-muted hover:text-text-secondary'
                        }
                        ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {tick.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30"
            >
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}

          {/* Start Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            whileHover={isValid && !isLoading ? { scale: 1.01 } : undefined}
            whileTap={isValid && !isLoading ? { scale: 0.98 } : undefined}
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className={`
              w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300
              ${isValid && !isLoading
                ? 'btn-gradient'
                : 'bg-surface-elevated text-text-muted cursor-not-allowed border border-border-subtle'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Setting up interview...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Interview</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
