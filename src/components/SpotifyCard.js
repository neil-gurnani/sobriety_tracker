import React, { useState } from "react";

function formatPlayedAt(iso) {
  if (!iso) return "Recently played";
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function SpotifyCard({ spotify }) {
  const {
    clientId,
    saveId,
    connected,
    snapshot,
    status,
    error,
    lastUpdated,
    connect,
    disconnect,
    refreshHistory
  } = spotify;
  const [draftId, setDraftId] = useState(clientId);
  const track = snapshot.recent;
  const favorite = snapshot.favorite;
  const art = track?.image || "/soundtrack.svg";

  return (
    <section className="spotify-card" aria-label="Your soundtrack">
      <div className="spotify-topline">
        <div className="spotify-kicker">♪ YOUR SOUNDTRACK</div>
        {connected ? (
          <span className="spotify-connected">Spotify connected</span>
        ) : (
          <span className="spotify-preview">Preview</span>
        )}
      </div>

      <div className="spotify-track">
        <img src={art} alt={track?.album ? `${track.album} artwork` : "Soundtrack artwork"} />
        <div>
          <div className="spotify-label">
            {track?.isPlaying ? "Playing now" : "Your most recently played song"}
          </div>
          <h3>{track?.name || "Your favorite track"}</h3>
          <p className="spotify-artist">{track?.artist || "Artist name"}</p>
          <p className="spotify-meta">
            {track?.isDemo ? "Recently played" : formatPlayedAt(track?.playedAt)}
          </p>
          {favorite && !favorite.isDemo && favorite.name !== track?.name && (
            <p className="spotify-favorite">Current favorite: {favorite.name}</p>
          )}
        </div>
      </div>

      <div className="spotify-divider">
        <span>LAST LISTENED ON SPOTIFY</span>
        {track?.url && (
          <a href={track.url} target="_blank" rel="noreferrer" aria-label="Open this song on Spotify">
            ↗
          </a>
        )}
      </div>

      {!connected && (
        <div className="spotify-setup">
          <label htmlFor="spotify-client-id">SPOTIFY CLIENT ID</label>
          <div className="spotify-id-row">
            <input
              id="spotify-client-id"
              value={draftId}
              onChange={e => setDraftId(e.target.value)}
              placeholder="Paste your Spotify Client ID"
              autoComplete="off"
            />
            <button type="button" className="ghost-button" onClick={() => saveId(draftId)}>
              Save
            </button>
          </div>
          <p className="spotify-help">
            Create an app at developer.spotify.com, then add{" "}
            <code>{window.location.origin}/</code> as a redirect URI.
          </p>
        </div>
      )}

      {error && <p className="spotify-error">{error}</p>}

      {connected ? (
        <div className="spotify-actions">
          <button type="button" className="spotify-connect" onClick={refreshHistory} disabled={status === "loading"}>
            {status === "loading" ? "Refreshing…" : "Refresh soundtrack"}
          </button>
          <button type="button" className="text-button spotify-disconnect" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button type="button" className="spotify-connect" onClick={connect}>
          ♪ Connect with Spotify
        </button>
      )}

      <p className="spotify-footnote">
        {connected && lastUpdated
          ? `Listening history updates automatically. Last refresh ${lastUpdated.toLocaleTimeString()}.`
          : "Illustrative design — actual song information appears after connecting your Spotify account."}
      </p>
    </section>
  );
}
