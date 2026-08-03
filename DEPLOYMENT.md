# Deploying for free

This app runs end-to-end on free tiers. Nothing here costs money for a demo/portfolio deployment.

| Piece | Service | Free tier notes |
|-------|---------|-----------------|
| Database (Postgres) | **Neon** | Always-available serverless Postgres |
| Cache (Redis) | **Upstash** (optional) | App runs fine without it — Redis is a non-fatal dependency |
| Backend (Express API) | **Render** web service | Spins down after ~15 min idle → first request is slow (cold start) |
| Frontend (Vite/React) | **Vercel** | Hobby tier |
| Google auth | **Firebase** Spark | Free |
| Flights / Payments | **Amadeus** test tier / **Razorpay** test mode | Free |

> Accounts, sign-ins, and entering secrets must be done by you in each provider's dashboard.

---

## 1. Database — Neon (Postgres)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string. Ensure it ends with `?sslmode=require`, e.g.
   `postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`
3. You'll paste this as `DATABASE_URL` on the backend (step 3). Migrations run
   automatically on deploy via the server's `build` script (`prisma migrate deploy`).

## 2. Cache — Upstash (optional)

- Create a Redis database at [upstash.com](https://upstash.com), copy the `rediss://` URL → `REDIS_URL`.
- **Or skip it:** leave `REDIS_URL` unset and the app runs without caching.

## 3. Backend — Render

1. New → **Web Service** → connect the GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm run build`  (installs, generates Prisma client, runs migrations)
   - **Start Command:** `npm start`
3. Environment variables (Render dashboard → Environment):

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon connection string (with `?sslmode=require`) |
   | `JWT_SECRET` | long random string |
   | `REFRESH_TOKEN_SECRET` | different long random string |
   | `JWT_EXPIRES_IN_SECONDS` | `3600` |
   | `REFRESH_TOKEN_EXPIRES_IN_SECONDS` | `604800` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | your Vercel URL (fill after step 4), e.g. `https://your-app.vercel.app` |
   | `REDIS_URL` | Upstash URL, or omit |
   | `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` | from Amadeus |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay (test) |
   | `FIREBASE_*` | service-account fields (see `server/.env.example`) |

4. Deploy. Note the service URL, e.g. `https://flight-api.onrender.com`.
   - Health check: `GET https://flight-api.onrender.com/health` → `{"status":"ok"}`.

> **Cross-site cookies:** the frontend and backend are on different domains, so for
> auth cookies to work in production the server's cookie options need
> `sameSite: "none"` + `secure: true`. The code currently uses `sameSite: "lax"`
> (the alternate config is commented in `server/src/controllers/authController.js`).
> The client also sends the token via the `Authorization: Bearer` header as a
> fallback, which the auth middleware already accepts, so login works either way.

## 4. Frontend — Vercel

1. New Project → import the repo → set **Root Directory** to `client`.
2. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Environment variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://flight-api.onrender.com/api` |
   | `VITE_FIREBASE_API_KEY` … `VITE_FIREBASE_APP_ID` | Firebase web app config |

4. Deploy. Copy the resulting URL and set it as `CORS_ORIGIN` on Render (step 3),
   then redeploy the backend so CORS allows the frontend origin.

## 5. Firebase (Google login)

- In the Firebase console, add your Vercel domain under **Authentication → Settings → Authorized domains**.
- Backend uses the service-account fields (`FIREBASE_*`); frontend uses the web-app config (`VITE_FIREBASE_*`).

---

## Quick checklist

- [ ] Neon Postgres created, `DATABASE_URL` copied (with `?sslmode=require`)
- [ ] Render backend deployed, `/health` returns 200
- [ ] `CORS_ORIGIN` on Render = Vercel URL
- [ ] Vercel frontend deployed, `VITE_API_BASE_URL` = Render `/api`
- [ ] Firebase authorized domains include the Vercel URL
- [ ] (Prod cookies) switch to `sameSite:"none"` + `secure:true` if you want cookie-based auth across domains

## Cost

**$0/month.** Trade-offs to know: Render free services cold-start after idle (~50s first request), and Neon/Upstash free tiers have generous but finite limits — all fine for a portfolio demo.
