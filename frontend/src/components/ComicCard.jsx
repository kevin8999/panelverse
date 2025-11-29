import { API_BASE_URL } from "../config"
import { useState } from "react"

export default function ComicCard({ 
  id, 
  title, 
  description, 
  coverUrl, 
  tags, 
  onClick,
  isOwner = false,
  isSaved = false,
  onDelete,
  onEdit,
  onSave,
  showActions = true
}) {
  const [saving, setSaving] = useState(false)
  
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
      {/* Save button (top right) */}
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

      {/* cover */}
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

      {/* meta */}
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-100 group-hover:text-indigo-400">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
        )}
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
          <button className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700">
            Read
          </button>
          
          {/* Edit/Delete buttons for owner */}
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