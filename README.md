# Ridge

Ridge is a customer service chat app for Allegheny Gear Co. It uses the Google
Gemini model through the AI SDK and runs its tools on the server.

## Setup

Use Node.js 20 or newer. Install dependencies with `npm install`, then add the
server-only Google API key to `.env.local`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
```

Start the app with `npm run dev` and visit http://localhost:3000.

The key is read by the `/api/chat` server route and must not be prefixed with
`NEXT_PUBLIC_`.

## Deploy to Vercel

Import the repository in Vercel, set `GOOGLE_GENERATIVE_AI_API_KEY` in the
project's Environment Variables for the desired deployment environments, then
deploy. The app does not use the Vercel AI Gateway.

## Validation

- `npm run lint`
- `npx tsc --noEmit`
- `npm run test:e2e`
