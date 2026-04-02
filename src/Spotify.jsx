import React from 'react'
import MacWindow from './components/windows/MacWindow'
import './spotify.scss'

const Spotify = () => {
  return (
    <MacWindow width='max(30vw)' height='50%'>
      <div className="spotify-window">
        <iframe
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DXc2aPBXGmXrt?utm_source=generator&theme=0"
          width="100%"
          height="352"
          style={{ borderRadius: "12px", border: "none" }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </MacWindow>
  )
}

export default Spotify