export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/60">
      <div className="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-slate-500 md:flex-row">
        <p>© {new Date().getFullYear()} PanelVerse. All rights reserved.</p>
        <a
          className="font-medium text-indigo-600 hover:underline"
          href="https://github.com/kevin8999/panel-verse"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
