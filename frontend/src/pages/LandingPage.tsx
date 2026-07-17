import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  MessageSquareText,
  BarChart3,
  ArrowRight,
  Brain,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Smart Resume Analysis',
    description:
      'We analyze your resume and the target job description to build a deep understanding of your profile.',
  },
  {
    icon: MessageSquareText,
    title: 'AI-Powered Interview',
    description:
      'Experience a dynamic, structured interview with questions tailored specifically to your experience.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Report',
    description:
      'Receive instant, comprehensive feedback including scores, strengths, and actionable improvement areas.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30">
      {/* Hero Section */}
      <section className="relative pb-32 px-8 flex flex-col items-center justify-center min-h-[85vh] section-glow overflow-hidden" style={{ paddingTop: '160px' }}>
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-[400px] h-[300px] bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-14 h-14 rounded-xl bg-surface border border-border-subtle flex items-center justify-center mb-8 shadow-2xl"
          >
            <Brain className="w-7 h-7 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white mb-6"
          >
            Master your next <br className="hidden md:block" />
            <span className="gradient-text">technical interview.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            AI-generated interviews tailored to your resume and target role. Practice realistically, get immediate feedback, and land the job.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <button
              onClick={() => navigate('/setup')}
              className="group flex items-center gap-2.5 px-8 py-4 btn-gradient rounded-full text-lg active:scale-95 transition-transform"
            >
              Start Practicing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 px-8 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
              Engineered for Success
            </h2>
            <p className="text-text-secondary font-light">
              Everything you need to prepare, analyze, and conquer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card p-7 group hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 text-primary group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2.5 text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed font-light text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 text-text-muted text-sm border-t border-border-subtle">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-medium text-text-secondary">AiiN</span>
          </div>
          <p>Built for the modern candidate.</p>
        </div>
      </footer>
    </div>
  );
}
