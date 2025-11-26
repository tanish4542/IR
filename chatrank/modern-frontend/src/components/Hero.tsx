import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  const nav = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" />
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Search smarter with an AI-powered chat experience
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-4 text-white/70 text-lg"
          >
            ChatRank blends traditional ranking (TF‑IDF, cosine similarity) with conversational AI
            for fast, explainable answers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-8 flex items-center gap-4"
          >
            <button onClick={() => nav('/chat')} className="btn-primary">
              Access the Chatbot
            </button>
            <span className="text-white/60">Default dark theme • Smooth animations</span>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass rounded-2xl p-6 min-h-[240px]"
        >
          <div className="text-white/70">Animated illustration placeholder</div>
          <div className="mt-4 h-40 rounded-xl bg-white/5" />
        </motion.div>
      </div>
    </section>
  );
}


