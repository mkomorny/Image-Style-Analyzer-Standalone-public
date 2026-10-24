# Image Style Analyzer - Standalone

Local desktop and web app that analyzes image style with Grok vision models. It extracts lighting, composition, color, brushwork, and camera-like settings from a photo.

## Requirements

- Node.js 20+
- An [xAI API key](https://console.x.ai/)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example env file and add your key:

   ```bash
   copy .env.example .env
   ```

   Then set `XAI_API_KEY` in `.env`. Do not commit `.env`.

3. Start the local server:

   ```bash
   npm run dev
   ```

   Open http://127.0.0.1:3000

## Desktop app

```bash
npm run electron:dev
```

Windows installer:

```bash
npm run electron:build
```

## Notes

- The app can also store the xAI key through the in-app **API Key** dialog.
- Uploaded images stay local in `uploads/` and are not part of this repo.
