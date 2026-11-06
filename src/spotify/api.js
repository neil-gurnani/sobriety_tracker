import { getValidAccessToken } from "./auth";

const API = "https://api.spotify.com/v1";

async function spotifyFetch(path) {
  const token = await getValidAccessToken();
  if (!token) {
    const error = new Error("Not connected to Spotify.");
    error.code = "disconnected";
    throw error;
  }

  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 204) return null;

  if (response.status === 401) {
    const error = new Error("Spotify session expired.");
    error.code = "disconnected";
    throw error;
  }

  if (!response.ok) {
    throw new Error("Could not load Spotify listening history.");
  }

  return response.json();
}

function mapTrack(track, playedAt, isPlaying) {
  if (!track) return null;
  const image = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || "";
  return {
    id: track.id,
    name: track.name,
    artist: (track.artists || []).map(artist => artist.name).join(", "),
    album: track.album?.name || "",
    image,
    url: track.external_urls?.spotify || "",
    playedAt,
    isPlaying
  };
}

export async function fetchListeningSnapshot() {
  const [currentlyPlaying, recentlyPlayed, topTracks] = await Promise.all([
    spotifyFetch("/me/player/currently-playing"),
    spotifyFetch("/me/player/recently-played?limit=1"),
    spotifyFetch("/me/top/tracks?limit=1&time_range=short_term")
  ]);

  const currentTrack = currentlyPlaying?.item
    ? mapTrack(currentlyPlaying.item, new Date().toISOString(), Boolean(currentlyPlaying.is_playing))
    : null;

  const recentItem = recentlyPlayed?.items?.[0];
  const recentTrack = recentItem ? mapTrack(recentItem.track, recentItem.played_at, false) : null;
  const favoriteTrack = mapTrack(topTracks?.items?.[0], null, false);

  return {
    recent: currentTrack || recentTrack,
    favorite: favoriteTrack
  };
}
