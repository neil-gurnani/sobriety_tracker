# One Day at a Time — Sobriety Tracker

A personal dashboard for Neil's alcohol-free journey since February 22, 2023.

Built with Create React App. No backend is required: notes stay in the browser, and Spotify login uses PKCE in the client.

## Features
- Live sobriety counter (years, months, days, plus hours/minutes/seconds)
- Latest Spotify song, current favorite, PKCE login, token refresh, and auto-refresh
- Personal motivation
- Daily encouragement
- Upcoming sobriety milestone
- Craving toolkit and private notes

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000.

## Spotify setup

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URIs:
   - `http://localhost:3000/`
   - `http://localhost:3000`
3. Copy the Client ID into the soundtrack card, or put it in `.env`:

```bash
cp .env.example .env
```

Then set `REACT_APP_SPOTIFY_CLIENT_ID` and restart `npm start`.

The app requests:

- `user-read-recently-played`
- `user-read-currently-playing`
- `user-read-playback-state`
- `user-top-read`

Tokens stay in `localStorage` on this device and refresh automatically.

## Build

```bash
npm run build
```

If you deploy it, add that production URL as another Spotify redirect URI.

## Privacy
Start date, notes, and Spotify tokens are stored only in this browser. Clearing site data removes them.

## Medical note
This is a personal tracker, not medical care. Alcohol withdrawal can be dangerous; talk with a clinician before stopping if you drink heavily or regularly.
