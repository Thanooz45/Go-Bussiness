# Go Business — Referral Dashboard

A React-based referral management dashboard.

## Setup

```bash
npm install
copy .env.example .env
npm start
```

Set `REACT_APP_API_BASE_URL` in `.env` to the base URL of your API. The
`.env` file is ignored by Git and must not contain credentials or other
secrets.

The app runs at http://localhost:3000.

## Folder Structure

```
src/
  App.jsx                        # BrowserRouter + Routes
  index.js                       # Entry: renders <App />
  index.css                      # Global reset & body styles
  components/
    ProtectedRoute.jsx            # Checks jwt_token cookie
    Navbar.jsx                    # Top nav with Log out button
    Navbar.css
  pages/
    LoginPage.jsx                 # /login — public
    LoginPage.css
    DashboardPage.jsx             # / — protected, main dashboard
    DashboardPage.css
    ReferralDetailPage.jsx        # /referral/:id — protected
    ReferralDetailPage.css
    NotFoundPage.jsx              # * — 404, public
    NotFoundPage.css
public/
  index.html
package.json
```

## Features

- JWT auth via cookie (`jwt_token`)
- Protected routes redirect to `/login` when unauthenticated
- Authenticated users on `/login` redirect to `/`
- Dashboard: Overview metrics, Service summary, Share referral section
- Referrals table with search (API call), sort (API call), client-side pagination (10/page)
- Referral detail page at `/referral/:id`
- 404 page (not wrapped in ProtectedRoute)

## Deploy

```bash
npm run build
# Upload /build folder to Vercel
```
