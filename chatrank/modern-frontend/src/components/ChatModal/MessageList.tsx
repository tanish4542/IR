import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble, { Message } from './MessageBubble';

function TypingDots() {
  return (
    <div className="flex items-center gap-1 text-white/60">
      <span className="animate-bounce">•</span>
      <span className="animate-bounce [animation-delay:.15s]">•</span>
      <span className="animate-bounce [animation-delay:.3s]">•</span>
    </div>
  );
}

export default function MessageList({
  messages,
  isStreaming,
  onRetry
}: {
  messages: Message[];
  isStreaming: boolean;
  onRetry: () => void;
}) {
  return (
    <div>
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          >
            <MessageBubble message={m} />
            {m.error && (
              <button onClick={onRetry} className="text-xs text-red-300 underline ml-2">retry</button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {isStreaming && (
        <div className="mt-2">
          <TypingDots />
        </div>
      )}
    </div>
  );
}


