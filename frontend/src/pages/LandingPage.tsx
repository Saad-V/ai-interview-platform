import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[180px]" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-6">

        <div className="max-w-3xl text-center">

          {/* Badge */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary"
          >
            AI Powered Technical Interviews
          </motion.div>

          {/* Title */}

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-bold tracking-tight leading-tight md:text-7xl"
          >
            Practice Technical
            <br />
            Interviews
            <span className="text-primary"> with AI.</span>
          </motion.h1>

          {/* Description */}

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-text-secondary"
          >
            Upload your resume and the job description.
            AiiN creates a personalized interview,
            evaluates every answer, and generates
            a comprehensive performance report.
          </motion.p>

          {/* Button */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-14"
          >
            <button
              onClick={() => navigate("/setup")}
              className="group inline-flex h-14 items-center gap-3 rounded-xl bg-primary px-10 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-primary-hover"
            >
              Start Interview

              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Workflow */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 flex items-center justify-center gap-4 text-sm text-text-muted"
          >
            <span>Resume</span>

            <span className="text-primary">→</span>

            <span>Interview</span>

            <span className="text-primary">→</span>

            <span>Report</span>
          </motion.div>

        </div>

      </main>

    </div>
  );
}