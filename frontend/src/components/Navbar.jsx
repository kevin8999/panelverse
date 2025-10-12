import { useState } from "react";

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
  >
    {children}
  </a>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="container flex items-center justify-between py-3">
        <a href="/home" className="text-xl font-bold tracking-tight text-indigo-600">
          PanelVerse
        </a>

        {/* desktop */}
        <ul className="hidden items-center gap-1 md:flex">
          <li><NavLink href="/home">Home</NavLink></li>
          <li><NavLink href="/browse">Browse</NavLink></li>
          <li><NavLink href="/upload">Upload</NavLink></li>
          <li><NavLink href="/profile">Profile</NavLink></li>
          <li>
            <a href="/logout" className="ml-1 rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600">
              Logout
            </a>
          </li>
        </ul>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <ul className="container grid gap-1 py-3">
            {["Home", "Browse", "Upload", "Profile"].map((item) => (
              <li key={item}>
                <a
                  className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href={`/${item.toLowerCase()}`}
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a className="block rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600" href="/logout">
                Logout
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
