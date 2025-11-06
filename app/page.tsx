'use client'

import { useState, useEffect, useRef } from 'react'

interface Track {
  id: number
  title: string
  artist: {
    name: string
  }
  album: {
    cover_medium: string
    title: string
  }
  duration: number
  preview: string
}

interface Album {
  id: number
  title: string
  cover_medium: string
  artist: {
    name: string
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchChartTracks()
    fetchChartAlbums()
  }, [])

  const fetchChartTracks = async () => {
    try {
      const response = await fetch('https://api.deezer.com/chart/0/tracks?limit=20', {
        method: 'GET',
      })
      const data = await response.json()
      setTracks(data.data || [])
    } catch (error) {
      console.error('Error fetching chart tracks:', error)
    }
  }

  const fetchChartAlbums = async () => {
    try {
      const response = await fetch('https://api.deezer.com/chart/0/albums?limit=12', {
        method: 'GET',
      })
      const data = await response.json()
      setAlbums(data.data || [])
    } catch (error) {
      console.error('Error fetching chart albums:', error)
    }
  }

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      fetchChartTracks()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      })
      const data = await response.json()
      setTracks(data.data || [])
    } catch (error) {
      console.error('Error searching tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchTracks(searchQuery)
  }

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = track.preview
        audioRef.current.play()
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black p-6 border-r border-gray-800">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-500">Spotify Clone</h1>
        </div>

        <nav className="space-y-4">
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <span>Search</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
            <span>Your Library</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 pb-32">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>
        </form>

        {/* Featured Albums */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {albums.map((album) => (
              <div key={album.id} className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition cursor-pointer">
                <img src={album.cover_medium} alt={album.title} className="w-full aspect-square object-cover rounded-md mb-4" />
                <h3 className="font-semibold truncate">{album.title}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks List */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? 'Search Results' : 'Top Tracks'}
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition cursor-pointer ${
                    currentTrack?.id === track.id ? 'bg-gray-800' : ''
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <span className="w-8 text-gray-400">{index + 1}</span>
                  <img src={track.album.cover_medium} alt={track.title} className="w-12 h-12 rounded mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-gray-400">{track.artist.name}</p>
                  </div>
                  <span className="text-gray-400 mr-4">{track.album.title}</span>
                  <span className="text-gray-400">{formatDuration(track.duration)}</span>
                  {currentTrack?.id === track.id && (
                    <div className="ml-4">
                      {isPlaying ? (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center space-x-4 flex-1">
              <img src={currentTrack.album.cover_medium} alt={currentTrack.title} className="w-16 h-16 rounded" />
              <div>
                <h4 className="font-medium">{currentTrack.title}</h4>
                <p className="text-sm text-gray-400">{currentTrack.artist.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
                </svg>
              </button>

              <button
                onClick={() => playTrack(currentTrack)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>

              <button className="text-gray-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 flex justify-end">
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  )
}
