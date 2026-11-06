const KEYS = {
  verifier: "spotify_pkce_verifier",
  state: "spotify_oauth_state",
  tokens: "spotify_tokens",
  clientId: "spotify_client_id"
};

export function getStoredClientId() {
  return (
    localStorage.getItem(KEYS.clientId) ||
    process.env.REACT_APP_SPOTIFY_CLIENT_ID ||
    ""
  ).trim();
}

export function saveClientId(clientId) {
  localStorage.setItem(KEYS.clientId, clientId.trim());
}

export function savePkceSession({ verifier, state }) {
  sessionStorage.setItem(KEYS.verifier, verifier);
  sessionStorage.setItem(KEYS.state, state);
}

export function loadPkceSession() {
  return {
    verifier: sessionStorage.getItem(KEYS.verifier) || "",
    state: sessionStorage.getItem(KEYS.state) || ""
  };
}

export function clearPkceSession() {
  sessionStorage.removeItem(KEYS.verifier);
  sessionStorage.removeItem(KEYS.state);
}

export function saveTokens(tokens) {
  localStorage.setItem(KEYS.tokens, JSON.stringify(tokens));
}

export function loadTokens() {
  try {
    const raw = localStorage.getItem(KEYS.tokens);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearTokens() {
  localStorage.removeItem(KEYS.tokens);
}
