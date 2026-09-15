# Development Guide

## Project Overview

BookMySeat is a full-stack event and seat-booking application with a React/Vite client and a Node.js/Express server.

## Architecture

- **Client:** React + Vite + Tailwind CSS
- **State:** Redux Toolkit and RTK Query
- **Realtime:** Socket.io
- **Server:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT-based foundation
- **Logging:** Winston
- **API:** Versioned REST endpoints
- **Structure:** MVC, services, and repository layers

## Local Development

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Keep environment-specific values in local `.env` files and never commit secrets. Use the repository's `.env.example` files as the configuration reference.

## Contribution Workflow

1. Create a focused branch from the default branch.
2. Make one logical change at a time.
3. Run the relevant client/server checks before committing.
4. Review the diff for accidental secrets or generated files.
5. Open a pull request with a clear summary and testing notes.

## Security

Never commit API keys, database credentials, JWT secrets, session tokens, or production credentials. If a secret is exposed, rotate it immediately rather than relying only on removing it from a later commit.
