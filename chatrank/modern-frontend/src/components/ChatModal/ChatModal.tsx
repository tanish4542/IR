import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChat } from '@/lib/hooks/useChat';

export default function ChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { messages, send, isStreaming, retryLast } = useChat();
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end md:items-center justify-center p-4">
              <Dialog.Panel as={motion.div}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="w-full md:max-w-3xl glass rounded-2xl p-0"
              >
                <ChatHeader onClose={onClose} />
                <div className="max-h-[75vh] md:max-h-[65vh] overflow-y-auto px-4 py-3">
                  <MessageList messages={messages} isStreaming={isStreaming} onRetry={retryLast} />
                </div>
                <div className="border-t border-white/10 px-4 py-3">
                  <ChatInput onSend={send} disabled={isStreaming} />
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}


