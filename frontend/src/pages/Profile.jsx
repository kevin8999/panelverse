import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info that should have been saved on login/signup
    const stored = localStorage.getItem("panelverseUser");

    if (!stored) {
      // No user -> send to login
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse stored user", err);
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    // simple loading / redirect state
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-slate-300 text-sm">Loading your profile…</p>
      </div>
    );
  }

  const isArtist = user.role === "artist"; // role: "artist" or "viewer"/"consumer"

  const displayName = user.username || user.name || "Unnamed user";
  const email = user.email || "No email on file";
  const avatarLetter =
    (displayName && displayName[0] ? displayName[0] : "?").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold tracking-wide uppercase text-indigo-400 mb-1">
            Profile
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {isArtist ? "Artist Profile" : "Reader Profile"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            This page is customized based on your account type from login.
          </p>
        </header>

        {/* User info card */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold shadow-lg">
            {avatarLetter}
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
              {isArtist ? "Artist" : "Reader"}
            </p>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-slate-400">{email}</p>

            {/* Optional extra info from backend, if you add it later */}
            {user.bio && (
              <p className="mt-3 text-sm text-slate-300">{user.bio}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("panelverseUser");
              navigate("/login");
            }}
            className="mt-2 sm:mt-0 inline-flex items-center rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Log out
          </button>
        </section>

        {/* Stats & role-specific sections */}
        {isArtist ? <ArtistProfileSection /> : <ReaderProfileSection />}
      </div>
    </div>
  );
}

function ArtistProfileSection() {
  return (
    <>
      {/* Artist stats */}
      <section className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard label="Published comics" value="0" hint="Upload your first!" />
        <StatCard label="Followers" value="0" hint="Coming soon" />
        <StatCard label="Total views" value="0" hint="Coming soon" />
      </section>

      {/* Comics list placeholder */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your comics</h3>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Upload new comic
          </Link>
        </div>
        <p className="text-sm text-slate-400">
          Once you start uploading, your comics will show up here. You can then
          see stats like views and likes.
        </p>
      </section>

      {/* Artist settings / info */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold mb-2">Artist settings</h3>
        <p className="text-sm text-slate-400">
          In the future, you can customize your creator name, links to social
          media, and default upload settings here.
        </p>
      </section>
    </>
  );
}

function ReaderProfileSection() {
  return (
    <>
      {/* Reader stats */}
      <section className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard label="Comics read" value="0" hint="Start exploring!" />
        <StatCard label="Favorites" value="0" hint="Save comics you love" />
        <StatCard label="Reading streak" value="0 days" hint="Read daily!" />
      </section>

      {/* Library */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 mb-8">
        <h3 className="text-lg font-semibold mb-2">Your library</h3>
        <p className="text-sm text-slate-400">
          When you favorite or follow comics, they&apos;ll appear here so you
          can easily jump back in.
        </p>
      </section>

      {/* Reader preferences */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold mb-2">Reading preferences</h3>
        <p className="text-sm text-slate-400">
          Later you can personalize theme, content filters, and other settings
          to match how you like to read.
        </p>
      </section>
    </>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default Profile;
