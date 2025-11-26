import { useState } from 'react';
import { useSearch } from '@/lib/hooks/useSearch';
import { motion, AnimatePresence } from 'framer-motion';
import ResultsPanel from './Results/ResultsPanel';

export default function QuickSearch() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const { data, isFetching, error, search } = useSearch();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(query);
    (globalThis as any).__lastQuery = query;
    search(query, 5, 'combined');
  };

  return (
    <section className="mt-10">
      <form onSubmit={onSubmit} className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a quick search…"
          className="flex-1 rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button className="btn-primary">Search</button>
      </form>
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6"
          >
            <ResultsPanel
              query={submitted}
              loading={isFetching}
              error={error instanceof Error ? error.message : undefined}
              data={data || undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


