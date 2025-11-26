import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function FeatureCard({
  icon,
  title,
  summary,
  details,
  onDemo
}: {
  icon: string;
  title: string;
  summary: string;
  details: JSX.Element;
  onDemo?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl p-6">
      <button
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-1 text-white/70">{summary}</div>
          </div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4 text-sm">
              {details}
              {onDemo && (
                <button onClick={onDemo} className="mt-3 btn-primary text-sm px-4 py-2 rounded-full">
                  See demo
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


