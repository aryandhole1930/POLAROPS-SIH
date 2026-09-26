# POLAROPS — Vercel deployment

This repository is prepared as a single Vercel project:
- React/Vite frontend
- FastAPI backend/API
- same-origin API calls
- PostgreSQL remains the existing external database

## Required Vercel environment variables

Set these in Vercel Project Settings → Environment Variables:

DATABASE_URL
JWT_SECRET_KEY
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

Do not commit the real `.env`.

## Deploy

Push this repository to GitHub, import it into Vercel, and deploy from the repository root.

Build command:
npm run build

Output directory:
public

The deployed frontend calls the FastAPI endpoints on the same domain, for example:
POST /auth/login
GET /expeditions/
GET /cargo/
GET /emergencies/

After deployment, verify:
/
 /health
 /docs
