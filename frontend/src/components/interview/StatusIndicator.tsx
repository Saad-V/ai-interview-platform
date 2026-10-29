import { motion, AnimatePresence } from "framer-motion";
import type { InterviewPhase } from "../../types/interview";

interface StatusIndicatorProps {
  phase: InterviewPhase;
}

const statusConfig: Record<InterviewPhase, { label: string }> = {
  idle: { label: "Ready" },
  speaking: { label: "Speaking…" },
  listening: { label: "Listening…" },
  thinking: { label: "Thinking…" },
};

export default function StatusIndicator({ phase }: StatusIndicatorProps) {
  const { label } = statusConfig[phase];

  return (
    <div className="h-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mono text-text-secondary"
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
