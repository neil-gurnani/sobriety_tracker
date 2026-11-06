import { createCodeChallenge, createCodeVerifier, createState } from "./pkce";
import {
  clearPkceSession,
  clearTokens,
  getStoredClientId,
  loadPkceSession,
  loadTokens,
  savePkceSession,
  saveTokens
} from "./storage";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SCOPES = [
  "user-read-recently-played",
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-top-read"
].join(" ");

export function getRedirectUri() {
  return window.location.origin + "/";
}

function formBody(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export async function beginSpotifyLogin() {
  const clientId = getStoredClientId();
  if (!clientId) {
    throw new Error("Add your Spotify Client ID first.");
  }

  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = createState();
  savePkceSession({ verifier, state });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
    scope: SCOPES
  });

  window.location.assign(`${AUTH_URL}?${params.toString()}`);
}

async function requestTokens(body) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Spotify token request failed.");
  }

  const tokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };

  const previous = loadTokens();
  if (!tokens.refreshToken && previous?.refreshToken) {
    tokens.refreshToken = previous.refreshToken;
  }

  saveTokens(tokens);
  return tokens;
}

export async function exchangeCodeForTokens(code) {
  const clientId = getStoredClientId();
  const { verifier } = loadPkceSession();
  if (!clientId || !verifier) {
    throw new Error("Missing Spotify login session. Try connecting again.");
  }

  const tokens = await requestTokens({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier
  });

  clearPkceSession();
  return tokens;
}

export async function refreshAccessToken() {
  const clientId = getStoredClientId();
  const current = loadTokens();
  if (!clientId || !current?.refreshToken) {
    throw new Error("Spotify session expired. Connect again.");
  }

  return requestTokens({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: current.refreshToken
  });
}

export async function getValidAccessToken() {
  const current = loadTokens();
  if (!current?.accessToken) return null;
  if (current.expiresAt - 60_000 > Date.now()) return current.accessToken;

  try {
    const refreshed = await refreshAccessToken();
    return refreshed.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export function logoutSpotify() {
  clearTokens();
  clearPkceSession();
}

export async function completeSpotifyRedirect() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const code = params.get("code");
  const returnedState = params.get("state");
  const { state } = loadPkceSession();

  if (!error && !code) return { handled: false };

  window.history.replaceState({}, document.title, window.location.pathname);

  if (error) {
    return { handled: true, error: error.replace(/_/g, " ") };
  }

  if (returnedState && state && returnedState !== state) {
    return { handled: true, error: "Spotify login state did not match. Try again." };
  }

  await exchangeCodeForTokens(code);
  return { handled: true };
}
