import { useCallback, useEffect, useState } from "react";
import { fetchListeningSnapshot } from "../spotify/api";
import { beginSpotifyLogin, completeSpotifyRedirect, logoutSpotify } from "../spotify/auth";
import { getStoredClientId, loadTokens, saveClientId } from "../spotify/storage";

const DEMO_SNAPSHOT = {
  recent: {
    id: "demo-recent",
    name: "Your favorite track",
    artist: "Artist name",
    album: "Soundtrack",
    image: "",
    url: "https://open.spotify.com",
    playedAt: null,
    isPlaying: false,
    isDemo: true
  },
  favorite: {
    id: "demo-favorite",
    name: "Your favorite track",
    artist: "Artist name",
    isDemo: true
  }
};

export function useSpotify() {
  const [clientId, setClientId] = useState(() => getStoredClientId());
  const [connected, setConnected] = useState(() => Boolean(loadTokens()?.accessToken));
  const [snapshot, setSnapshot] = useState(DEMO_SNAPSHOT);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshHistory = useCallback(async () => {
    if (!loadTokens()?.accessToken) {
      setConnected(false);
      setSnapshot(DEMO_SNAPSHOT);
      return;
    }

    setStatus("loading");
    try {
      const next = await fetchListeningSnapshot();
      setSnapshot({
        recent: next.recent || DEMO_SNAPSHOT.recent,
        favorite: next.favorite || DEMO_SNAPSHOT.favorite
      });
      setConnected(true);
      setLastUpdated(new Date());
      setError("");
      setStatus("ready");
    } catch (err) {
      if (err.code === "disconnected") {
        logoutSpotify();
        setConnected(false);
        setSnapshot(DEMO_SNAPSHOT);
        setError("Spotify disconnected. Connect again to resume updates.");
      } else {
        setError(err.message);
      }
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const result = await completeSpotifyRedirect();
        if (cancelled) return;
        if (result.handled && result.error) {
          setError(result.error);
          setStatus("error");
          return;
        }
        if (result.handled) {
          setConnected(true);
        }
        await refreshHistory();
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [refreshHistory]);

  useEffect(() => {
    if (!connected) return undefined;
    const timer = setInterval(refreshHistory, 45000);
    return () => clearInterval(timer);
  }, [connected, refreshHistory]);

  function saveId(value) {
    saveClientId(value);
    setClientId(value.trim());
  }

  async function connect() {
    setError("");
    try {
      await beginSpotifyLogin();
    } catch (err) {
      setError(err.message);
    }
  }

  function disconnect() {
    logoutSpotify();
    setConnected(false);
    setSnapshot(DEMO_SNAPSHOT);
    setLastUpdated(null);
    setStatus("idle");
    setError("");
  }

  return {
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
  };
}
