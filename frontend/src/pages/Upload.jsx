import { useState } from "react"
import { API_BASE_URL } from "../config"

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

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

    // generate previews
    const newPreviews = validFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    setPreviews(newPreviews)
  }

  const handleFileChange = (e) => handleFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
  
    // Get token from localStorage (check login status first)
    const token = localStorage.getItem("token")
    if (!token) {
      setError("You must be logged in to upload. Please login first.")
      setUploading(false)
      return
    }

    if (!title.trim()) {
      setError("Please enter a post name.")
      return
    }
    if (files.length === 0) {
      setError("Please select at least one image.")
      return
    }
  
    setUploading(true)
    setError("")
  
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("tags", tags)
      files.forEach((file) => formData.append("files", file))
  
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
  
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Upload failed")
      }
  
      alert("Upload successful!")
      setTitle("")
      setDescription("")
      setTags("")
      setFiles([])
      setPreviews([])
      setError("")
    } catch (err) {
      setError(err.message || "Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl px-8 py-10">
        <h1 className="text-3xl font-semibold text-center mb-2">Upload Comic</h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Share your latest work with{" "}
          <span className="font-semibold text-indigo-400">Panel Verse</span>.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
            {error.includes("logged in") && (
              <div className="mt-2">
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 underline">
                  Click here to login
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-1 text-left"
            >
              Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post name"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1 text-left"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your comic..."
              rows={4}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium mb-1 text-left"
            >
              Tags (optional)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="action, superhero, marvel"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Upload Area */}
          <div>
            <label
              htmlFor="files"
              className="block text-sm font-medium mb-1 text-left"
            >
              Comic files
            </label>
            <label
              htmlFor="files"
              className="w-full h-36 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer text-center px-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {files.length > 0 ? (
                <>
                  <p className="text-sm text-indigo-400 mb-1">
                    {files.length} image(s) selected
                  </p>
                  <p className="text-xs text-slate-500">Click to change or select more</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-400">
                    Click here or drag & drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ⚡ Select multiple images at once (Cmd+Click or Shift+Click)
                  </p>
                </>
              )}
            </label>
            <input
              id="files"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((p) => (
                <div
                  key={p.name}
                  className="relative rounded-lg overflow-hidden border border-slate-700"
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-3"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Want to manage your uploads?{" "}
          <a
            href="/profile"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Go to Profile
          </a>
        </p>
      </div>
    </div>
  )
}
