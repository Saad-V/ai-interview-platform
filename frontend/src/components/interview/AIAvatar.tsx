import { motion, AnimatePresence } from "framer-motion";

export type InterviewPhase = "idle" | "speaking" | "listening" | "thinking";

interface AIAvatarProps {
  phase: InterviewPhase;
  audioLevel?: number;
}

export default function AIAvatar({ phase, audioLevel = 0 }: AIAvatarProps) {
  const blobClass = {
    idle: "blob-idle",
    speaking: "blob-speaking",
    listening: "blob-listening",
    thinking: "blob-idle",
  }[phase];

  // Scale the blob based on audio level when listening
  const dynamicScale = phase === "listening" ? 1 + (audioLevel * 0.4) : 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Main blob */}
      <motion.div
        className={`blob-base ${blobClass}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: dynamicScale, opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {/* Inner highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: "15%",
            left: "20%",
            width: "35%",
            height: "35%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Listening ripple rings */}
      <AnimatePresence>
        {phase === "listening" && (
          <>
            <motion.div
              key="ripple-1"
              className="blob-ripple-ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                width: 200,
                height: 200,
              }}
            />
            <motion.div
              key="ripple-2"
              className="blob-ripple-ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                animationDelay: "0.6s",
              }}
            />
            <motion.div
              key="ripple-3"
              className="blob-ripple-ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                animationDelay: "1.2s",
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Thinking spinner ring */}
      <AnimatePresence>
        {phase === "thinking" && (
          <motion.div
            key="think-ring"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="blob-thinking"
            style={{
              position: "absolute",
              width: 216,
              height: 216,
            }}
          >
            <div className="blob-ring" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
