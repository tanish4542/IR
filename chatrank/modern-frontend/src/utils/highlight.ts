export function highlightTerms(text: string, query: string) {
  if (!text || !query) return text;
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  let result = text;
  for (const term of terms) {
    const re = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    result = result.replace(re, '<mark class="bg-yellow-400/30">$1</mark>');
  }
  return result;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


