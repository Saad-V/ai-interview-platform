import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto card-bordered p-8">
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Step indicator column */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    backgroundColor: isCompleted
                      ? 'var(--color-success)'
                      : isActive
                        ? 'var(--color-primary)'
                        : 'var(--color-surface-elevated)',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10
                    ${isCompleted ? 'shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''}
                    ${isActive ? 'shadow-[0_0_16px_rgba(124,58,237,0.4)]' : ''}
                  `}
                  style={{
                    border: !isCompleted && !isActive ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <span className="text-sm font-medium text-text-muted">
                      {index + 1}
                    </span>
                  )}
                </motion.div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-border-subtle" />
                    {isCompleted && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="absolute inset-0 bg-success"
                      />
                    )}
                    {isActive && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '50%' }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-primary"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="pt-2 pb-12">
                <motion.p
                  animate={{
                    color: isCompleted || isActive
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-muted)',
                  }}
                  className="text-sm font-semibold"
                >
                  {step.label}
                </motion.p>
                {step.description && (
                  <p className="text-xs text-text-muted mt-1">{step.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
