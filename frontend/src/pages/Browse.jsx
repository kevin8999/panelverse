import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"
import ComicCard from "../components/ComicCard"

export default function Browse() {
  const [comics, setComics] = useState([])
  const [savedComicIds, setSavedComicIds] = useState(new Set())
  const [likedComicIds, setLikedComicIds] = useState(new Set())
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [tags, setTags] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchCurrentUser()
    fetchSavedComics()
    fetchLikedComics()
    fetchComics()
  }, [search, tags])

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUserId(data.id)
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    }
  }

  const fetchSavedComics = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/saved`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSavedComicIds(new Set(data.comics.map(c => c._id)))
      }
    } catch (err) {
      console.error("Failed to fetch saved comics:", err)
    }
  }

  const fetchLikedComics = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/liked`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLikedComicIds(new Set(data.comic_ids))
      }
    } catch (err) {
      console.error("Failed to fetch liked comics:", err)
    }
  }

  const fetchComics = async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (tags) params.append("tags", tags)
      params.append("limit", "20")

      const token = localStorage.getItem("token")
      const headers = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const res = await fetch(`${API_BASE_URL}/api/comics?${params}`, {
        headers,
      })

      if (!res.ok) {
        throw new Error("Failed to fetch comics")
      }

      const data = await res.json()
      setComics(data.comics || [])
    } catch (err) {
      setError(err.message || "Failed to load comics")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (comicId) => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const isSaved = savedComicIds.has(comicId)
      const method = isSaved ? "DELETE" : "POST"
      
      console.log(`${method} /api/comics/${comicId}/save`)
      
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}/save`, {
        method,
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        const result = await res.json()
        console.log("Save result:", result)
        setSavedComicIds(prev => {
          const newSet = new Set(prev)
          if (isSaved) {
            newSet.delete(comicId)
          } else {
            newSet.add(comicId)
          }
          return newSet
        })
        
        // Update save count in comics list
        setComics(prev => prev.map(comic => {
          if (comic._id === comicId) {
            return {
              ...comic,
              save_count: isSaved ? (comic.save_count || 0) - 1 : (comic.save_count || 0) + 1
            }
          }
          return comic
        }))
      } else {
        console.error("Failed to save comic, status:", res.status)
        const errorText = await res.text()
        console.error("Error response:", errorText)
      }
    } catch (err) {
      console.error("Failed to save comic:", err)
    }
  }

  const handleLike = async (comicId) => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const isLiked = likedComicIds.has(comicId)
      const method = isLiked ? "DELETE" : "POST"
      
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}/like`, {
        method,
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        setLikedComicIds(prev => {
          const newSet = new Set(prev)
          if (isLiked) {
            newSet.delete(comicId)
          } else {
            newSet.add(comicId)
          }
          return newSet
        })
        
        // Update like count in comics list
        setComics(prev => prev.map(comic => {
          if (comic._id === comicId) {
            return {
              ...comic,
              like_count: isLiked ? (comic.like_count || 0) - 1 : (comic.like_count || 0) + 1
            }
          }
          return comic
        }))
      }
    } catch (err) {
      console.error("Failed to like comic:", err)
    }
  }

  const handleDelete = async (comicId) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        setComics(prev => prev.filter(c => c._id !== comicId))
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Browse Comics</h1>

        {/* Search Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Filter by tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading comics...</p>
          </div>
        ) : (
          <>
            {/* No results */}
            {comics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No comics found.</p>
              </div>
            ) : (
              /* Comics Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {comics.map((comic) => (
                  <ComicCard
                    key={comic._id}
                    id={comic._id}
                    title={comic.title}
                    description={comic.description}
                    coverUrl={comic.cover_url}
                    tags={comic.tags}
                    isOwner={currentUserId === comic.author_id}
                    isSaved={savedComicIds.has(comic._id)}
                    isLiked={likedComicIds.has(comic._id)}
                    likeCount={comic.like_count || 0}
                    saveCount={comic.save_count || 0}
                    onSave={handleSave}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onClick={() => navigate(`/comic/${comic._id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}