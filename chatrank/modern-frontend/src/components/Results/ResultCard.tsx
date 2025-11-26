import { motion } from 'framer-motion';
import type { SearchResult } from './ResultsPanel';
import { highlightTerms } from '@/utils/highlight';

function Progress({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-brand-500 to-accent-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ResultCard({
  result,
  index,
  metric
}: {
  result: SearchResult;
  index: number;
  metric: 'combined' | 'cosine' | 'tfidf';
}) {
  const score =
    metric === 'combined'
      ? result.combined_score ?? 0
      : metric === 'cosine'
      ? result.cosine_score ?? 0
      : result.tfidf_term_score ?? 0;

  return (
    <motion.a
      href={result.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="block glass rounded-xl p-5 hover:bg-white/10"
    >
      <div className="flex items-start gap-4">
        <div className="h-8 w-8 rounded-full bg-white/10 grid place-items-center text-sm">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{result.title}</div>
          <div className="text-xs text-white/60 truncate">{result.domain || result.url}</div>
          {result.snippet && (
            <p className="mt-2 text-sm text-white/80 line-clamp-3" dangerouslySetInnerHTML={{ __html: highlightTerms(result.snippet || '', (globalThis as any).__lastQuery || '') }} />
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="rounded-full px-2 py-1 bg-white/5 border border-white/10">
              Cosine: {(result.cosine_score ?? 0).toFixed(3)}
            </span>
            <span className="rounded-full px-2 py-1 bg-white/5 border border-white/10">
              TF‑IDF: {(result.tfidf_term_score ?? 0).toFixed(3)}
            </span>
            <span className="rounded-full px-2 py-1 bg-white/5 border border-white/10">
              Combined: {(result.combined_score ?? 0).toFixed(3)}
            </span>
          </div>
          <div className="mt-3">
            <Progress value={score} />
          </div>
        </div>
      </div>
    </motion.a>
  );
}


