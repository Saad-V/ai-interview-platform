import { motion } from "framer-motion";
import { Hash } from "lucide-react";

interface InterviewProgressProps {
  turnCount: number;
}

export default function InterviewProgress({
  turnCount,
}: InterviewProgressProps) {
  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-[57px] left-0 right-0 h-0.5 bg-surface-elevated z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(turnCount * 10, 100)}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center mb-6"
      >
        <div className="badge badge-primary flex items-center gap-2">
          <Hash className="w-3.5 h-3.5" />
          <span>Question {turnCount}</span>
        </div>
      </motion.div>
    </>
  );
}