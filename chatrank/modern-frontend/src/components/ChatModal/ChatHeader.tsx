export default function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-500 grid place-items-center">🤖</div>
        <div>
          <div className="font-semibold">ChatRank Bot</div>
          <div className="text-xs text-white/60">Ask anything about your query</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Pin" className="rounded-lg px-3 py-2 bg-white/5 border border-white/10">📌</button>
        <button aria-label="Close" onClick={onClose} className="rounded-lg px-3 py-2 bg-white/5 border border-white/10">✕</button>
      </div>
    </div>
  );
}


