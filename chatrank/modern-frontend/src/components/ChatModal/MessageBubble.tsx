export type Message = { id: string; role: 'user' | 'assistant' | 'system'; content: string; ts: number; error?: boolean };

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm border
        ${isUser ? 'bg-brand-500/20 border-brand-500/40' : 'bg-white/5 border-white/10'}`}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-[10px] text-white/50 mt-2">
          {new Date(message.ts).toLocaleTimeString()}
          {message.error ? ' • failed' : ''}
        </div>
      </div>
    </div>
  );
}


