import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';
import { useSearch } from '@/lib/hooks/useSearch';

export default function Features() {
  const { search } = useSearch();
  const runDemo = (q: string) => () => search(q, 5, 'combined');
  return (
    <section className="mt-16">
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.4 }}>
          <FeatureCard
            icon="🤖"
            title="AI Answer"
            summary="Concise summaries powered by your chatbot backend."
            details={
              <div>
                <p>We call your bot endpoint and render an answer with sources if available.</p>
              </div>
            }
            onDemo={runDemo('benefits of tf idf')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: 0.05, duration: 0.4 }}>
          <FeatureCard
            icon="⚙️"
            title="Live Ranking"
            summary="TF‑IDF and cosine similarity computed in real time."
            details={
              <div className="space-y-2">
                <div className="font-semibold">TF‑IDF</div>
                <pre className="text-xs whitespace-pre-wrap">
TF = term count in document
IDF = log(N / (1 + df))
TF‑IDF(term, doc) = TF(term, doc) * IDF(term)
                </pre>
                <div className="font-semibold">Cosine similarity</div>
                <pre className="text-xs whitespace-pre-wrap">
cos(θ) = (A · B) / (||A|| × ||B||)
                </pre>
              </div>
            }
            onDemo={runDemo('cosine similarity example')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <FeatureCard
            icon="📊"
            title="Explainable Scores"
            summary="Combined metric with transparent breakdown."
            details={
              <div>
                <pre className="text-xs whitespace-pre-wrap">
Combined = α × Cosine + (1 − α) × TFIDF_Term_Score
Default α = 0.6
                </pre>
              </div>
            }
            onDemo={runDemo('explain combined rank')}
          />
        </motion.div>
      </div>
    </section>
  );
}


