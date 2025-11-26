import { useEffect, useRef, useState } from 'react';

export default function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend(value.trim());
        setValue('');
      }
    }
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <textarea
          ref={ref}
          aria-label="Message"
          className="w-full resize-none rounded-xl px-3 py-2 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-brand-500"
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
          disabled={disabled}
        />
        <div className="mt-2 flex gap-2">
          {['Summarize', 'Explain simply', 'Get sources'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { onSend(t); }}
              className="text-xs rounded-full px-3 py-1 bg-white/5 border border-white/10"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <button
        aria-label="Send"
        onClick={() => { if (value.trim()) { onSend(value.trim()); setValue(''); } }}
        className="btn-primary"
        disabled={disabled}
      >
        ➤
      </button>
    </div>
  );
}


