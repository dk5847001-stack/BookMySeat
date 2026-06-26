# EventX Ultra

Production-grade MERN SaaS foundation for an online event management and ticket booking platform.

## Stack

- React + Vite
- Tailwind CSS glassmorphism UI
- Framer Motion
- Redux Toolkit + RTK Query
- i18next
- Node.js + Express
- MongoDB + Mongoose
- MVC + Services + Repository architecture
- JWT auth base
- Socket.io
- Winston logging
- Rate limiting
- API versioning

## Structure

```text
client/   Vite React frontend
server/   Express API, Socket.io, MongoDB
```

## Setup

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
npm run dev
```

Update MongoDB and JWT values in `server/.env` before running the API against a real database.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Render, MongoDB Atlas, Cloudinary, environment variables, and production build steps.
