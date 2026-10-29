import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

interface ReplayButtonProps {
  onReplay: () => void;
  disabled?: boolean;
}

export default function ReplayButton({
  onReplay,
  disabled = false,
}: ReplayButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
      onClick={onReplay}
      className={`flex items-center gap-2 p-0 text-sm text-link ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <Volume2 className="w-4 h-4" />
      Replay
    </motion.button>
  );
}
