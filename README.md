# PwnedLookup

[![My Projects](https://img.shields.io/badge/See_My_Other_Projects-008DFF?style=for-the-badge&logo=googlechrome&logoColor=white)](https://denniskeefe.me/my-projects/) [![ko-fi](https://img.shields.io/badge/Buy_Me_a_Coffee-29ABE0?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/denniskeefe)

A lightweight web app for checking emails and passwords against the [Have I Been Pwned](https://haveibeenpwned.com) database. Runs locally or deploys to Vercel in one command.

## Features

- **Email breach lookup** — check one or more emails against all known breaches
- **Paste site lookup** — check if emails appear on Pastebin and similar sites
- **Password check** — uses k-anonymity (only a hash prefix is sent, your password never leaves your machine)
- **Browser-side API key** — users paste their own HIBP key; it's stored in `localStorage` and never hardcoded
- **Export results** — download breach and paste results as JSON, CSV, or PDF
- **Rate limit warnings** — proactive warning when submitting more than 10 emails; friendly message if the HIBP rate limit is hit

## Rate Limits

The HIBP basic plan allows **10 email lookups per minute**. The app will warn you if you submit more than 10 addresses at once and display a clear message if you hit the limit. Submit in batches of 10 or wait a minute between requests. Higher-tier plans have increased limits — see [HIBP pricing](https://haveibeenpwned.com/API/Key) for details.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- A [HIBP API key](https://haveibeenpwned.com/API/Key) (required for email lookups; password checks are free)

### Run locally

```bash
git clone https://github.com/denniskeefe/hibp-app.git
cd hibp-app
npm install
node server.js
```

Open [http://localhost:3737](http://localhost:3737), paste your API key into the banner, and start checking.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

No extra configuration needed — `vercel.json` is already set up. Each user enters their own API key in the browser; nothing is stored server-side.

## Project Structure

```
api/
  _hibp.js       # Shared fetch logic and helpers
  breaches.js    # POST /api/breaches — email breach lookup
  pastes.js      # POST /api/pastes  — paste site lookup
  password.js    # POST /api/password — pwned password check
public/
  index.html     # Single-page frontend (vanilla JS, no build step)
server.js        # Local dev Express server (delegates to /api/ handlers)
vercel.json      # Vercel routing config
```

## Security Notes

- The HIBP API key is stored in your browser's `localStorage` and sent as an `x-hibp-key` request header — it is never embedded in source code
- Password checks use the [k-anonymity model](https://haveibeenpwned.com/API/v3#PwnedPasswords): only the first 5 characters of the SHA-1 hash are transmitted
- If self-hosting for others, consider adding authentication in front of the app to prevent unauthorized use of your API key
