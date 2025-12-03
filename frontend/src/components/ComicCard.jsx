import { API_BASE_URL } from "../config"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function ComicCard({ 
  id, 
  title, 
  description, 
  coverUrl, 
  tags, 
  creatorName,
  creatorId,
  onClick,
  isOwner = false,
  isSaved = false,
  isLiked = false,
  likeCount = 0,
  saveCount = 0,
  onDelete,
  onEdit,
  onSave,
  onLike,
  showActions = true
}) {
  const [saving, setSaving] = useState(false)
  const [liking, setLiking] = useState(false)
  
  const handleSave = async (e) => {
    e.stopPropagation()
    if (saving || !onSave) return
    setSaving(true)
    try {
      await onSave(id)
    } finally {
      setSaving(false)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking || !onLike) return
    setLiking(true)
    try {
      await onLike(id)
    } finally {
      setLiking(false)
    }
  }
  
  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(id)
  }
  
  const handleDelete = async (e) => {
    e.stopPropagation()
    if (onDelete && window.confirm('Are you sure you want to delete this comic?')) {
      await onDelete(id)
    }
  }

  return (
    <article 
      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer relative"
      onClick={onClick}
    >
      {showActions && !isOwner && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition ${
            isSaved 
              ? 'bg-indigo-600 text-white' 
              : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800'
          }`}
          title={isSaved ? "Saved" : "Save comic"}
        >
          <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}

      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-slate-800 to-slate-900">
        {coverUrl ? (
          <img 
            src={`${API_BASE_URL}${coverUrl}`} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
            No Cover
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-100 group-hover:text-indigo-400">
          {title}
        </h3>

        {creatorName && creatorId && (
          <p className="text-sm text-slate-400">
            by{" "}
            <Link
              to={`/artist/${creatorId}`}
              className="text-indigo-400 hover:text-indigo-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {creatorName}
            </Link>
          </p>
        )}

        {description && (
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        )}
        
        <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {likeCount}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            {saveCount}
          </span>
        </div>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2 space-y-2">
          {showActions && !isOwner && (
            <div className="flex gap-2">
              <button 
                onClick={handleLike}
                disabled={liking}
                className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isLiked
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {isLiked ? 'Liked' : 'Like'}
              </button>
              <button className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
                Read
              </button>
            </div>
          )}

          {(!showActions || isOwner) && (
            <button className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
              Read
            </button>
          )}
          
          {showActions && isOwner && (
            <div className="flex gap-2">
              <button 
                onClick={handleEdit}
                className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-900/50 px-3 py-2 text-sm font-medium text-red-200 transition hover:bg-red-900/70"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
