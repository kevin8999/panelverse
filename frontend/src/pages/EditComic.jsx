import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../config"

export default function EditComic() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchComic()
  }, [id])

  const fetchComic = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/comics/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) throw new Error("Failed to load comic")

      const data = await res.json()
      setComic(data)
      setTitle(data.title)
      setDescription(data.description || "")
      setTags(data.tags?.join(", ") || "")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = (selected) => {
    if (!selected.length) return
    const validFiles = Array.from(selected).filter((f) =>
      f.type.startsWith("image/")
    )
    if (validFiles.length !== selected.length) {
      setError("Only image files are allowed.")
      return
    }

    setError("")
    setFiles(validFiles)

    const newPreviews = validFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    setPreviews(newPreviews)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    setUpdating(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("tags", tags)
      files.forEach((file) => formData.append("files", file))

      const res = await fetch(`${API_BASE_URL}/api/comics/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Update failed")
      }

      alert("Comic updated successfully!")
      navigate(`/comic/${id}`)
    } catch (err) {
      setError(err.message || "Update failed. Try again.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading...</p>
      </div>
    )
  }

  if (error && !comic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/browse")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl px-8 py-10">
        <h1 className="text-3xl font-semibold text-center mb-2">Edit Comic</h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Update your comic details or add new chapters
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1 text-left">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-left">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1 text-left">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="action, superhero, marvel"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Current Pages */}
          <div>
            <label className="block text-sm font-medium mb-2 text-left">
              Current Pages ({comic?.file_count || 0})
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {comic?.files?.slice(0, 8).map((file, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-700">
                  <img
                    src={`${API_BASE_URL}${file.url}`}
                    alt={`Page ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add New Pages */}
          <div>
            <label htmlFor="files" className="block text-sm font-medium mb-1 text-left">
              Add New Pages (Optional)
            </label>
            <label
              htmlFor="files"
              className="w-full h-36 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer text-center px-3"
            >
              {files.length > 0 ? (
                <>
                  <p className="text-sm text-indigo-400 mb-1">
                    {files.length} new page(s) to add
                  </p>
                  <p className="text-xs text-slate-500">Click to change</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">
                    Click to add new chapter pages
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Select multiple images at once
                  </p>
                </>
              )}
            </label>
            <input
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* New Pages Preview */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((p) => (
                <div
                  key={p.name}
                  className="relative rounded-lg overflow-hidden border border-indigo-500"
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-24 object-cover"
                  />
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-xs px-1 rounded">
                    NEW
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/comic/${id}`)}
              className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? "Updating..." : "Update Comic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
