import { useState } from 'react';
import ResultCard from './ResultCard';
import { AnimatePresence, Reorder } from 'framer-motion';

export type SearchResult = {
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  cosine_score?: number;
  tfidf_term_score?: number;
  combined_score?: number;
};

export default function ResultsPanel({
  query,
  loading,
  error,
  data
}: {
  query: string;
  loading: boolean;
  error?: string;
  data?: { ai_answer?: string; results?: SearchResult[]; did_you_mean?: string };
}) {
  const [metric, setMetric] = useState<'combined' | 'cosine' | 'tfidf'>('combined');
  const results = data?.results ?? [];
  const sorted = [...results].sort((a, b) => {
    const score = (r: SearchResult) =>
      metric === 'combined'
        ? r.combined_score ?? 0
        : metric === 'cosine'
        ? r.cosine_score ?? 0
        : r.tfidf_term_score ?? 0;
    return (score(b) - score(a));
  });

  return (
    <div className="space-y-4">
      {error && <div className="glass rounded-xl p-4 text-red-300">{error}</div>}
      {data?.ai_answer && (
        <div className="glass rounded-xl p-5">
          <div className="text-sm text-white/60 mb-2">AI Answer</div>
          <div>{data.ai_answer}</div>
        </div>
      )}
      {data?.did_you_mean && (
        <div className="rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30">
          Did you mean: <span className="font-semibold">{data.did_you_mean}</span>?
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-white/70">Showing results for: <span className="text-white font-medium">{query}</span></div>
        <div className="flex gap-2">
          {(['combined', 'cosine', 'tfidf'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs rounded-full px-3 py-1 border ${metric === m ? 'bg-brand-500 text-white border-brand-500' : 'bg-white/5 border-white/10'}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence initial={false}>
        <Reorder.Group axis="y" values={sorted} onReorder={() => {}}>
          {sorted.map((r, i) => (
            <Reorder.Item key={`${r.url}-${i}`} value={r}>
              <ResultCard index={i} result={r} metric={metric} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </AnimatePresence>
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}


