import { useState } from 'react';
import { postChat } from '@/lib/api';
import type { Message } from '@/components/ChatModal/MessageBubble';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setStreaming] = useState(false);
  const useMocks = Boolean(import.meta.env.VITE_USE_MOCKS);

  const send = async (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', ts: Date.now() };
    setMessages((m) => [...m, assistantMsg]);
    setStreaming(true);
    try {
      let answer = 'No response';
      let sources: string[] | undefined = undefined;
      if (useMocks) {
        await new Promise((r) => setTimeout(r, 800));
        answer = 'Mock: Here is a helpful answer explaining your topic in 2-3 sentences.';
        sources = ['https://example.com/a', 'https://example.com/b'];
      } else {
        const res = await postChat(text);
        answer = res.data?.answer ?? 'No response';
        sources = res.data?.sources;
      }
      setMessages((m) => m.map((mm) => (mm.id === assistantId ? { ...mm, content: answer, ts: Date.now() } : mm)));
      if (sources && sources.length) {
        const sourcesMsg: Message = { id: crypto.randomUUID(), role: 'system', content: `Sources: ${sources.join(', ')}`, ts: Date.now() };
        setMessages((m) => [...m, sourcesMsg]);
      }
    } catch (e) {
      if (useMocks) {
        // Fallback to mock on error when mocks enabled
        const answer = 'Mock (fallback): service unavailable, showing sample answer.';
        const sources = ['https://example.com/a', 'https://example.com/b'];
        setMessages((m) => m.map((mm) => (mm.id === assistantId ? { ...mm, content: answer, ts: Date.now() } : mm)));
        const sourcesMsg: Message = { id: crypto.randomUUID(), role: 'system', content: `Sources: ${sources.join(', ')}`, ts: Date.now() };
        setMessages((m) => [...m, sourcesMsg]);
      } else {
        setMessages((m) => m.map((mm) => (mm.id === assistantId ? { ...mm, content: 'Failed to get response', error: true } : mm)));
      }
    } finally {
      setStreaming(false);
    }
  };

  const retryLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) send(lastUser.content);
  };

  return { messages, isStreaming, send, retryLast };
}


