# One Day at a Time — Sobriety Tracker

A simple, responsive React app built with Create React App.

## Features
- Live sobriety counter (days, hours, minutes, seconds)
- Calendar duration (years, months, days)
- Editable start date (defaults to February 22, 2023)
- Milestone progress
- Rotating daily encouragement
- Practical craving and social-pressure toolkit
- Private notes saved in browser localStorage

## Run locally

You need Node.js and npm installed.

```bash
npm install
npm start
```

Open http://localhost:3000.

## Build for deployment

```bash
npm run build
```

The production-ready site is created in the `build/` folder. You can deploy that folder to a static host such as Netlify or Vercel.

## Privacy
The app has no backend and does not send your start date or notes to a server. Data is stored in localStorage in the browser on the device where you use the app. Clearing browser data may erase it.

## Medical note
This app is a personal tracking and encouragement tool, not medical advice or a substitute for treatment. Alcohol withdrawal can be dangerous for people who drink heavily or regularly; consult a healthcare professional before stopping.
