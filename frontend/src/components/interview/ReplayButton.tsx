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
      className={`
        flex items-center gap-2
        px-5 py-2.5
        rounded-xl
        text-sm font-medium
        border transition-all
        ${
          disabled
            ? "bg-surface-elevated/50 text-text-muted border-border-subtle/50 cursor-not-allowed opacity-50"
            : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-primary hover:text-text-primary cursor-pointer"
        }
      `}
    >
      <Volume2 className="w-4 h-4" />
      Replay
    </motion.button>
  );
}
