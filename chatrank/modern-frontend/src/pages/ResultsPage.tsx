import ResultsPanel from '@/components/Results/ResultsPanel';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/lib/hooks/useSearch';
import { useEffect } from 'react';

export default function ResultsPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { data, isFetching, error, search } = useSearch();

  useEffect(() => {
    if (q) search(q, 5, 'combined');
  }, [q]);

  return (
    <div className="py-10 md:py-16">
      <h1 className="text-2xl font-semibold">Results</h1>
      <div className="mt-6">
        <ResultsPanel
          query={q}
          loading={isFetching}
          error={error instanceof Error ? error.message : undefined}
          data={data || undefined}
        />
      </div>
    </div>
  );
}


