import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import ComicCard from "../components/ComicCard"

export default function ArtistPage() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [comics, setComics] = useState([])

  useEffect(() => {
    axios.get(`/api/creators/${id}`).then((res) => {
      setArtist(res.data.creator)
      setComics(res.data.comics)
    })
  }, [id])

  if (!artist) return <div className="p-6 text-slate-300">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
        <p className="text-slate-300 mt-2">{artist.bio || "No bio available."}</p>
      </div>

      <h2 className="text-xl text-white font-semibold">Comics by {artist.name}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {comics.map((comic) => (
          <ComicCard
            key={comic.id}
            id={comic.id}
            title={comic.title}
            description={comic.description}
            coverUrl={comic.coverUrl}
            tags={comic.tags}
            creatorName={artist.name}
            creatorId={artist.id}
            likeCount={comic.likes}
            saveCount={comic.saves}
            onClick={() => window.location.href = `/comic/${comic.id}`}
          />
        ))}
      </div>
    </div>
  )
}
