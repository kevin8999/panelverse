import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm">
        <p>© {new Date().getFullYear()} PanelVerse. All rights reserved.</p>
        <a
          href="https://github.com/kevin8999/cen-3031-project"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}
