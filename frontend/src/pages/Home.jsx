import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"
import Footer from "../components/Footer"
import ComicCard from "../components/ComicCard"

export default function Home() {
  const [comics, setComics] = useState([])
  const [savedComicIds, setSavedComicIds] = useState(new Set())
  const [likedComicIds, setLikedComicIds] = useState(new Set())
  const [currentUserId, setCurrentUserId] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCurrentUser()
    fetchSavedComics()
    fetchLikedComics()
    fetchFeaturedComics()
  }, [])

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
        setUserRole(data.role)
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

  const fetchFeaturedComics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/comics?limit=6`)
      if (res.ok) {
        const data = await res.json()
        setComics(data.comics || [])
      }
    } catch (err) {
      console.error("Failed to fetch comics:", err)
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
      
      const res = await fetch(`${API_BASE_URL}/api/comics/${comicId}/save`, {
        method,
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
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

  return (
    <div className="min-h-screen">

      {/* hero */}
      <section className="relative border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="container py-12 md:py-16">
          <h1 style={{ textAlign: "left" }} className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome back to <span className="text-indigo-600">PanelVerse</span>!
          </h1>
          <p style={{ textAlign: "left" }} className="mt-3 max-w-2xl text-lg text-slate-600">
            Discover the latest creations from your favorite artists and explore new stories.
          </p>

          {/* quick actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/browse">
              Browse Comics
            </a>
            {/* Only show upload button for artists and admins */}
            {(userRole === "artist" || userRole === "admin") && (
              <a style={{ color: "white" }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" href="/upload">
                Upload New Work
              </a>
            )}
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading comics...</p>
          </div>
        ) : comics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No comics uploaded yet. Be the first to upload!</p>
            <a href="/upload" className="mt-4 inline-block text-indigo-600 hover:underline">
              Upload a comic →
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {comics.map((c) => (
              <ComicCard 
                key={c._id} 
                id={c._id}
                title={c.title} 
                description={c.description}
                coverUrl={c.cover_url}
                tags={c.tags}
                isOwner={c.author_id === currentUserId}
                isSaved={savedComicIds.has(c._id)}
                isLiked={likedComicIds.has(c._id)}
                likeCount={c.like_count || 0}
                saveCount={c.save_count || 0}
                onSave={handleSave}
                onLike={handleLike}
                onClick={() => navigate(`/comic/${c._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
