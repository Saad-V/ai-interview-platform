import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
  label: string;
  color?: string;
}

export default function ScoreGauge({
  score,
  maxScore = 100,
  size = 160,
  label,
  color = '#7C3AED',
}: ScoreGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = () => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return color;
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const scoreColor = getScoreColor();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle glow behind gauge */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{ backgroundColor: scoreColor }}
        />

        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-elevated)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 6px ${scoreColor}40)`,
            }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-3xl font-bold text-text-primary"
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-xs text-text-muted">/ {maxScore}</span>
        </div>
      </div>

      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
  );
}
