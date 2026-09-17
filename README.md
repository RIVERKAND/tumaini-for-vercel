# Tumaini Shop — Vercel build

This is the same app, restructured to fit how Vercel actually runs code.
Read this first if you're not sure why it looks different from the
"regular" version — it explains it in plain terms.

## Why this version is different (the simple explanation)

Think of a normal server like a shop that's always open: it opens once,
and stays open, remembering everything that happened during the day —
that's how the original version works. It runs on a machine (Render,
Railway, a VPS) that stays on the whole time.

Vercel doesn't work that way. It's "serverless" — instead of one shop
staying open, every single request gets a brand-new pop-up stall that's
built, used once, and torn down immediately after. That's great for
speed and cost, but it means:

- **Nothing can be remembered in memory between requests.** The original
  version kept orders/stock/team in a variable while the server ran —
  that variable resets on every request here, so it would look like data
  keeps disappearing.
- **Nothing can be safely saved to a local file either**, for the same
  reason — the "stall" is torn down and a new one is built next time,
  possibly on a different machine entirely.
- **A live connection that stays open (what powered instant staff alerts)
  isn't really possible** — every pop-up stall closes right after
  answering one request, so nothing can stay "listening."

So this version:
- Saves data to a small **hosted Redis database** (Upstash) instead of a
  local file — that's the one thing that *does* stay around between
  requests, because it lives on its own separate always-on service, not
  inside Vercel's temporary stalls.
- Sends staff alerts by **polling** — the dashboard quietly asks "anything
  new?" every 5 seconds instead of being pushed a live update instantly.
  Slightly less instant, but works fine within Vercel's model.

## Deploying to Vercel

1. Create a free Redis database at **[upstash.com](https://upstash.com)**
   (or, from your Vercel project, go to Storage → Marketplace → Redis,
   which creates one and wires up the environment variables for you
   automatically).
2. Push this folder to a GitHub repo, then import it into Vercel
   (vercel.com → Add New → Project).
3. In the Vercel project's Environment Variables settings, add:
   - `JWT_SECRET` — any long random string
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — from your
     Upstash database's dashboard (skip this if you used the Vercel
     Marketplace integration — it sets these for you)
4. Deploy. Vercel automatically serves everything in `public/` as your
   site, and everything under `api/` as the backend — no extra config
   needed.

First deploy seeds three staff logins (change these from the Team tab
once you've signed in as the owner):

| Name | Role | Password |
|---|---|---|
| Grace Wanjiru | Owner | `tumaini2024` |
| Peter Otieno | Worker | `worker123` |
| Mary Achieng | Worker | `worker456` |

---

## If you'd rather use Hostinger instead

Good news: **Hostinger doesn't need any of these changes.** Hostinger's
Node.js hosting (and any Hostinger VPS) runs your app the "normal" way —
one process that stays running and can write to its own disk — which is
exactly how the *original* version of this app (the one with `server.js`
and a `data/db.json` file) was built. Use that version, unchanged, on
Hostinger:

1. In hPanel, create a **Node.js** application (or set one up on a VPS).
2. Upload the original project's files (`server.js`, `db.js`,
   `package.json`, `public/`, etc. — not this `api/`-based folder).
3. Set the startup file to `server.js`.
4. Add an environment variable `JWT_SECRET` (a long random string) in
   hPanel's Node.js app settings.
5. Set `npm install && npm start` as the install/start commands, then
   start the app.

That's genuinely it — no database changes, no polling, no rewrite. The
plain-language version: **Hostinger gives you an "always-open shop," so
the simpler original code already fits it.** This Vercel folder only
exists because Vercel's "pop-up stall" model needed the app adapted to
match.
