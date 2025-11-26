import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Header({ onOpenChat }: { onOpenChat: () => void }) {
  const nav = useNavigate();
  return (
    <header className="mx-auto max-w-7xl px-6 md:px-10 py-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-400 grid place-items-center">
          <span className="text-xl font-bold">C</span>
        </div>
        <div>
          <div className="text-xl font-semibold">ChatRank</div>
          <div className="text-xs text-white/60">Chatbot-Based Mini Search Engine</div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => nav('/chat')}
        className="btn-primary"
      >
        Access the Chatbot
      </motion.button>
    </header>
  );
}


