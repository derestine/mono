# Loyalty

A minimal Next.js app with theme switching functionality.

## Features

- 🌓 Light & Dark Mode
- 💾 Persistent theme storage
- 📱 Responsive design
- ⚡ Built with Next.js 15

## Tech Stack

- Next.js 15
- Tailwind CSS
- Zustand
- TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── ThemeProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       └── index.ts
├── lib/
│   └── utils.ts
└── stores/
    └── theme.ts
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
