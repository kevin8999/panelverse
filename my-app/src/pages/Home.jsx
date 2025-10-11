import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ComicCard from "../components/ComicCard";

const mockComics = [
  { id: 1, title: "Galaxy Girl", artist: "Maya Ganot" },
  { id: 2, title: "Shadowline", artist: "Chris Okorochukwu" },
  { id: 3, title: "Dreamwalker", artist: "Hithisha Dubbaka" },
  { id: 4, title: "PanelQuest", artist: "Kevin Duong" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto">
        <section className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back to PanelVerse!
          </h1>
          <p className="text-gray-600 text-lg">
            Discover the latest creations from your favorite artists and explore
            new stories.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Featured Works
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mockComics.map((comic) => (
              <ComicCard key={comic.id} title={comic.title} artist={comic.artist} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
