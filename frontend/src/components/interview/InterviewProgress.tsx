import { motion } from "framer-motion";

interface InterviewProgressProps {
  turnCount: number;
}

export default function InterviewProgress({
  turnCount,
}: InterviewProgressProps) {
  return (
    <div aria-label={`Question ${turnCount} progress`} className="fixed left-0 right-0 top-[68px] z-40 h-px bg-border">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: `${Math.min(turnCount * 10, 100)}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}