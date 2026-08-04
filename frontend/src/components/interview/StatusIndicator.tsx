import { motion, AnimatePresence } from "framer-motion";
import type { InterviewPhase } from "./AIAvatar";

interface StatusIndicatorProps {
  phase: InterviewPhase;
}

const statusConfig: Record<InterviewPhase, { label: string; color: string }> = {
  idle: { label: "Ready", color: "text-text-muted" },
  speaking: { label: "Speaking…", color: "text-accent" },
  listening: { label: "Listening…", color: "text-success" },
  thinking: { label: "Thinking…", color: "text-accent" },
};

export default function StatusIndicator({ phase }: StatusIndicatorProps) {
  const { label, color } = statusConfig[phase];

  return (
    <div className="h-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-2 text-sm font-medium ${color}`}
        >
          {/* Pulsing dot */}
          {phase !== "idle" && (
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  phase === "listening" ? "bg-success" : "bg-accent"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  phase === "listening" ? "bg-success" : "bg-accent"
                }`}
              />
            </span>
          )}
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
