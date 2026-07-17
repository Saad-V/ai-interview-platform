import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Ai</span>
            <span className="text-text-primary">iN</span>
          </span>
        </Link>
      </div>
    </motion.nav>
  );
}
