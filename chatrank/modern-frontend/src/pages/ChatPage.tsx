import ChatHeader from '@/components/ChatModal/ChatHeader';
import MessageList from '@/components/ChatModal/MessageList';
import ChatInput from '@/components/ChatModal/ChatInput';
import { useChat } from '@/lib/hooks/useChat';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function ChatPage() {
  const nav = useNavigate();
  const { messages, send, isStreaming, retryLast } = useChat();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div className="py-8 md:py-12">
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-500 grid place-items-center">🤖</div>
            <div>
              <div className="font-semibold">ChatRank Bot</div>
              <div className="text-xs text-white/60">Ask anything about your query</div>
            </div>
          </div>
          <button aria-label="Back to home" onClick={() => nav('/')} className="rounded-lg px-3 py-2 bg-white/5 border border-white/10">← Home</button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-4 py-3">
          <MessageList messages={messages} isStreaming={isStreaming} onRetry={retryLast} />
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <ChatInput onSend={send} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}


