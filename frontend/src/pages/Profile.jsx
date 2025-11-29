import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { API_BASE_URL } from "../config"
import ComicCard from "../components/ComicCard"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("uploads")
  const [myComics, setMyComics] = useState([])
  const [savedComics, setSavedComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    fetchUser()
    fetchMyComics()
    fetchSavedComics()
  }, [location.pathname]) // Refetch when navigating to profile

  // Refetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem("token")
        if (token) {
          fetchSavedComics()
          fetchMyComics()
        }
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const fetchUser = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  const fetchMyComics = async () => {
    const token = localStorage.getItem("token")
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/comics`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setMyComics(data.comics || [])
      }
    } catch (err) {
      console.error("Failed to fetch my comics:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedComics = async () => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/saved`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        console.log("Saved comics data:", data)
        setSavedComics(data.comics || [])
      } else {
        console.error("Failed to fetch saved comics, status:", res.status)
        const errorText = await res.text()
        console.error("Error response:", errorText)
      }
    } catch (err) {
      console.error("Failed to fetch saved comics:", err)
    }
  }

  const handleUnsave = async (comicId) => {
    const token = localStorage.getItem("token")
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}/save`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        setSavedComics(prev => prev.filter(c => c._id !== comicId))
      }
    } catch (err) {
      console.error("Failed to unsave comic:", err)
    }
  }

  const handleDelete = async (comicId) => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        setMyComics(prev => prev.filter(c => c._id !== comicId))
      } else {
        alert("Failed to delete comic")
      }
    } catch (err) {
      console.error("Failed to delete comic:", err)
      alert("Failed to delete comic")
    }
  }

  const handleEdit = (comicId) => {
    navigate(`/edit/${comicId}`)
  }

  const comics = activeTab === "uploads" ? myComics : savedComics

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8">
          {user && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold shadow-lg">
                {(user.email?.[0] || "U").toUpperCase()}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{user.username || "User"}</h1>
                <p className="text-slate-400">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token")
                  navigate("/login")
                }}
                className="mt-2 sm:mt-0 inline-flex items-center rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Log out
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">My Comics</p>
              <p className="mt-2 text-2xl font-semibold">{myComics.length}</p>
              <p className="mt-1 text-xs text-slate-500">
                {myComics.filter(c => c.published).length} published
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Saved Comics</p>
              <p className="mt-2 text-2xl font-semibold">{savedComics.length}</p>
              <p className="mt-1 text-xs text-slate-500">Your favorites</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Pages</p>
              <p className="mt-2 text-2xl font-semibold">
                {myComics.reduce((sum, comic) => sum + (comic.file_count || 0), 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Created by you</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("uploads")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "uploads"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            My Uploads ({myComics.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "saved"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Saved Comics ({savedComics.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading...</p>
          </div>
        ) : comics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {activeTab === "uploads"
                ? "You haven't uploaded any comics yet."
                : "You haven't saved any comics yet."}
            </p>
            <button
              onClick={() => navigate(activeTab === "uploads" ? "/upload" : "/browse")}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {activeTab === "uploads" ? "Upload Comic" : "Browse Comics"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comics.map((comic) => (
              <ComicCard
                key={comic._id}
                id={comic._id}
                title={comic.title}
                description={comic.description}
                coverUrl={comic.cover_url}
                tags={comic.tags}
                isOwner={activeTab === "uploads"}
                isSaved={activeTab === "saved"}
                onSave={activeTab === "saved" ? handleUnsave : undefined}
                onDelete={activeTab === "uploads" ? handleDelete : undefined}
                onEdit={activeTab === "uploads" ? handleEdit : undefined}
                onClick={() => navigate(`/comic/${comic._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
