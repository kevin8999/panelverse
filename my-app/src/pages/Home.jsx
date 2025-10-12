import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ComicCard from "../components/ComicCard";

const mock = [
  { id: 1, title: "Galaxy Girl", artist: "Maya Ganot" },
  { id: 2, title: "Shadowline", artist: "Chris Okorochukwu" },
  { id: 3, title: "Dreamwalker", artist: "Hithisha Dubbaka" },
  { id: 4, title: "PanelQuest", artist: "Kevin Duong" },
  { id: 5, title: "Neon Harbor", artist: "Guest Artist" },
  { id: 6, title: "Clockwork Alley", artist: "Guest Artist" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* hero */}
      <section className="relative border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="container py-12 md:py-16">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome back to <span className="text-indigo-600">PanelVerse</span>!
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Discover the latest creations from your favorite artists and explore new stories.
          </p>

          {/* quick actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/browse">
              Browse Comics
            </a>
            <a className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" href="/upload">
              Upload New Work
            </a>
          </div>
        </div>
      </section>

      {/* featured grid */}
      <section className="container py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Featured Works</h2>
          <a className="text-sm font-medium text-indigo-600 hover:underline" href="/browse">
            View all
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mock.map((c) => (
            <ComicCard key={c.id} title={c.title} artist={c.artist} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
