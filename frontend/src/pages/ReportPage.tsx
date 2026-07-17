import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Award,
  Target,
  MessageCircle,
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import { useInterview, useInterviewDispatch } from '../hooks/useInterview';

function getRecommendationStyle(recommendation: string) {
  const lower = recommendation.toLowerCase();
  if (lower.includes('strong') || lower.includes('hire') && !lower.includes('not')) {
    return {
      bg: 'bg-success/10',
      border: 'border-success/20',
      text: 'text-success',
      icon: Award,
    };
  }
  if (lower.includes('not') || lower.includes('reject') || lower.includes('no')) {
    return {
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      text: 'text-danger',
      icon: AlertTriangle,
    };
  }
  return {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
    icon: Target,
  };
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { report } = useInterview();
  const dispatch = useInterviewDispatch();

  if (!report) {
    return (
      <div className="min-h-screen pb-12 px-8 flex items-center justify-center" style={{ paddingTop: '140px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-text-secondary mb-4">No report available.</p>
          <button
            onClick={() => navigate('/setup')}
            className="px-6 py-3 btn-gradient rounded-xl transition-colors"
          >
            Start New Interview
          </button>
        </motion.div>
      </div>
    );
  }

  const recStyle = getRecommendationStyle(report.recommendation);
  const RecIcon = recStyle.icon;

  const handleNewInterview = () => {
    dispatch({ type: 'RESET' });
    navigate('/setup');
  };

  return (
    <div className="min-h-screen pb-16 px-8" style={{ paddingTop: '140px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="badge badge-primary">
              <Award className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider text-[10px] font-semibold">Final Analysis</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Interview <span className="gradient-text">Report</span>
          </h1>
          <p className="text-text-secondary">
            Here&apos;s your comprehensive performance analysis
          </p>
        </motion.div>

        {/* Scores grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          {/* Overall score — prominent */}
          <div className="card p-7 flex flex-col items-center justify-center">
            <ScoreGauge
              score={report.overall_score}
              label="Overall Score"
              size={160}
            />
          </div>

          {/* Technical score */}
          <div className="card p-7 flex flex-col items-center justify-center">
            <ScoreGauge
              score={report.technical_score}
              label="Technical"
              size={140}
              color="#7C3AED"
            />
          </div>

          {/* Communication score */}
          <div className="card p-7 flex flex-col items-center justify-center">
            <ScoreGauge
              score={report.communication_score}
              label="Communication"
              size={140}
              color="#A78BFA"
            />
          </div>
        </motion.div>

        {/* Recommendation Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`flex items-center gap-4 p-5 rounded-xl ${recStyle.bg} border ${recStyle.border} mb-8`}
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <RecIcon className={`w-5 h-5 ${recStyle.text}`} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-0.5 font-medium">Recommendation</p>
            <p className={`text-lg font-semibold ${recStyle.text}`}>
              {report.recommendation}
            </p>
          </div>
        </motion.div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {report.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                  {strength}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-3">
              {report.areas_for_improvement.map((area, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-start gap-3 text-sm text-text-secondary"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                  {area}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-10"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Summary</h3>
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            {report.summary}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-text-muted text-sm mb-4">
            Ready to improve your performance?
          </p>
          <button
            onClick={handleNewInterview}
            className="group inline-flex items-center gap-3 px-8 py-4 btn-gradient rounded-xl text-lg transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            Start New Interview
          </button>
        </motion.div>
      </div>
    </div>
  );
}
