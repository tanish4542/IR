const steps = [
  { title: 'Search', desc: 'Enter your query in the quick search or chat.' },
  { title: 'Rank', desc: 'We compute TF‑IDF, cosine, and a combined score.' },
  { title: 'Explain', desc: 'See AI answers, did‑you‑mean, and score breakdowns.' }
];
export default function HowItWorks() {
  return (
    <section className="mt-16 glass rounded-xl p-6">
      <h2 className="text-xl font-semibold">How it works</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="rounded-lg bg-white/5 p-5 border border-white/10">
            <div className="text-lg font-semibold">{s.title}</div>
            <div className="mt-2 text-white/70">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


