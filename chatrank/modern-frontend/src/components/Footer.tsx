export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 md:px-10 py-12 text-white/60">
      <div className="border-t border-white/10 pt-8 text-sm">
        © {new Date().getFullYear()} ChatRank. All rights reserved.
      </div>
    </footer>
  );
}


