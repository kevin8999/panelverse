export default function ComicCard({ title, artist }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* cover */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
          Image Placeholder
        </div>
      </div>

      {/* meta */}
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600">
          {title}
        </h3>
        <p className="text-sm text-slate-500">by {artist}</p>

        <div className="pt-2">
          <button className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
            Read
          </button>
        </div>
      </div>
    </article>
  );
}
