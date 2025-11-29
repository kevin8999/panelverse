import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"

export default function ComicReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    fetchComic()
  }, [id])

  const fetchComic = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const res = await fetch(`${API_BASE_URL}/api/comics/${id}`, {
        headers,
      })

      if (!res.ok) {
        throw new Error("Failed to load comic")
      }

      const data = await res.json()
      setComic(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading comic...</p>
      </div>
    )
  }

  if (error || !comic) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "Comic not found"}</p>
        <button
          onClick={() => navigate("/browse")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Browse
        </button>
      </div>
    )
  }

  const pages = comic.files || []
  const currentPageData = pages[currentPage]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/browse")}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              ← Back to Browse
            </button>
            <h1 className="text-2xl font-bold mt-1">{comic.title}</h1>
            {comic.description && (
              <p className="text-slate-400 text-sm mt-1">{comic.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">
              Page {currentPage + 1} of {pages.length}
            </p>
            {comic.tags && comic.tags.length > 0 && (
              <div className="flex gap-1 mt-1 justify-end">
                {comic.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comic Viewer */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No pages available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Page */}
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <img
                src={`${API_BASE_URL}${currentPageData.url}`}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-auto"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="text-sm text-slate-400">
                Page {currentPage + 1} / {pages.length}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Page Thumbnails */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-6">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`aspect-[2/3] rounded overflow-hidden border-2 transition ${
                    currentPage === index
                      ? "border-indigo-500"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <img
                    src={`${API_BASE_URL}${page.thumbnail_url || page.url}`}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
