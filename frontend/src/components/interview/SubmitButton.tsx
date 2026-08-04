import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export default function SubmitButton({
  disabled,
  isSubmitting,
  onSubmit,
}: SubmitButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
      onClick={onSubmit}
      className={`
        flex items-center gap-2
        px-7 py-3
        rounded-xl
        font-medium
        transition-all
        ${
          disabled
            ? "bg-surface-elevated text-text-muted border border-border-subtle cursor-not-allowed"
            : "btn-gradient cursor-pointer"
        }
      `}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Evaluating…
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Submit Answer
        </>
      )}
    </motion.button>
  );
}