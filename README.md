# Lakshya One

> Last updated: July 04, 2026  
> Project type: Full-stack school discovery, comparison, inquiry, and admin-management platform  
> Status: Core platform phases implemented. Blog CMS, Razorpay, reviews, real AI recommendations, and direct WhatsApp routing are future-only modules.  
> Latest sync: Homepage/About redesign, 22-section school profile sync, admin account editing with forced session invalidation, featured listings, compare/maps/nearby, Sentry monitoring, radius-based Near Me search, locality autocomplete, locality/address geocoding, and Section 1 location-field consolidation.

Lakshya One is a full-stack school discovery platform for Indian parents, schools, and platform administrators. Parents can search and compare schools, view detailed school profiles, save favourites, send inquiries, and discover nearby schools. School administrators can manage their school profile and leads. Platform administrators can verify schools, manage users, control featured listings, monitor inquiries, and maintain platform quality.

Older documents or legacy code comments may still mention **SchoolFinder** or **SchoolSetu**. The current product name used in updated documentation and brand-facing content is **Lakshya One**.

---

## Documentation Links

- [Frontend documentation](frontend/Frontend.md)
- [Backend documentation](backend/Backend.md)
- [Feature plan](plan.md)
- [Future features](Future-Features.md)

---

## Technology Overview

| Layer | Technology | Local Port | Main Responsibility |
|---|---|---:|---|
| Frontend | Next.js 14 App Router, React, TypeScript, Tailwind CSS, NextAuth v5 | `3000` | Public pages, dashboards, auth sessions, BFF proxy routes, upload route, SEO, profile editor, UI interactions |
| Backend | Express.js 5, TypeScript, Prisma, JWT, Zod | `4000` | REST API, authentication, authorization, validation, business rules, school profile persistence, cache, monitoring |
| Database | PostgreSQL on Neon | — | Users, schools, inquiries, favourites, contact submissions, audit logs, profile data, locality coordinates |
| Media | Cloudinary | — | School logos, cover images, gallery images, download URLs |
| Email/SMS | Brevo, Fast2SMS | — | Password reset email OTP and phone OTP flows |
| Monitoring | Sentry | — | Frontend and backend error tracking |
| Location Data | Browser Geolocation API, OpenStreetMap Nominatim | — | Near Me search, locality/address/city geocoding, approximate coordinates |

---

## Current Project Status

| Area | Status | Notes |
|---|---|---|
| Public homepage | ✅ Complete | Redesigned Lakshya One landing page with search, dynamic browse, featured schools, value sections, FAQs, static blog preview, and CTA |
| About page | ✅ Complete | Animated brand page with story, stats, parent/school value, process, values, FAQs, and CTA |
| Contact page | ✅ Complete | DB save, EmailJS notification, and Google Sheets webhook support |
| Parent discovery flow | ✅ Complete | School listing, detail page, favourites, inquiries, compare, maps, SEO pages |
| School profile editor | ✅ Complete | Advanced 22-section editor with backend-synced fields and validation |
| Location fields consolidation | ✅ Complete | Location inputs moved into Section 1 Basic Info; backend/schema/API unchanged |
| Inquiry and lead system | ✅ Complete | Parent inquiries, school/admin tracking, lead statuses, spam protection |
| Featured listings | ✅ Complete | Admin featured toggle, expiry support, public featured ordering |
| Compare schools | ✅ Complete | Compare up to 3 schools through localStorage |
| Maps and nearby schools | ✅ Complete | Coordinates, map embed, nearby school results, radius options |
| Near Me search | ✅ Complete | Browser location + 1/2/3/5/8/10 km radius options |
| Locality autocomplete | ✅ Implemented | Public locality/address suggestions and listing-page locality filter wiring |
| Admin account editing | ✅ Complete | FULL_ACCESS admin can edit name/email/phone/password with session invalidation on email/password change |
| Sentry monitoring | ✅ Complete | Frontend/browser, frontend server/edge, backend, global error UI |
| Blog CMS | ⏸️ Skipped for now | Tracked in Future-Features.md |
| Razorpay payments | ⏸️ Future | Tracked in Future-Features.md |
| Reviews | ⏸️ Future | Tracked in Future-Features.md |
| Real AI recommendations | ⏸️ Future | Current route is placeholder only |

---

## Core Platform Features

### Public and Parent-Facing Features

- Redesigned Lakshya One homepage with hero, search, dynamic browse filters, featured schools, why/how sections, parent and school sections, testimonials, FAQs, blog-preview cards, and final CTA.
- Public school listing page with filters for city, state, board, medium, management type, search text, locality, and Near Me radius mode.
- Locality autocomplete search that suggests locality/address values from approved visible schools.
- Near Me search using browser location and allowed radius values of `1`, `2`, `3`, `5`, `8`, and `10` km.
- Dynamic SEO pages for city, state, and board discovery.
- School detail pages with profile data, inquiry CTA, favourites, featured badge, gallery, contact details, map embed, and nearby schools.
- Compare Schools page with up to 3 schools saved locally in the browser.
- AI recommendation page available as a Coming Soon placeholder.
- Animated About page and complete Contact page.
- Contact form saves to backend database and can also notify through EmailJS and Google Sheets webhook.
- Sitemap, robots.txt, page metadata, and JSON-LD structured data.
- Mobile-first responsive UI.

### Parent Account Features

- Parent registration and login with email/password.
- Google OAuth login for parents.
- OTP-based password reset flow.
- Parent dashboard with profile management, favourites, recently viewed schools, and sent inquiries.
- Save/remove favourite schools.
- Send inquiries to approved schools.
- View inquiry status updates.
- Spam protection through duplicate checks, rate limits, and honeypot fields.

### School Administrator Features

- School admin registration and login.
- 4-step school registration wizard with local draft persistence.
- School dashboard with listing status and inquiry summary.
- Full 22-section school profile editor.
- Section 1 Basic Info now contains all location-related fields together: Locality/Mohalla, City, State, Full Address, Google Maps Embed URL, Latitude, and Longitude.
- Section 20 Contact now focuses on phone, email, website, social links, additional phone numbers, and admission coordinators.
- Profile editor supports Indian school categories, board values, state board names, medium Other, classes offered, languages, timings, recognition, affiliation, uniform, canteen, student-teacher ratio, total students, facilities, sports, programs, streams, board results, scholarships, hostel, transport, safety, gallery, downloads, FAQs, and custom fields.
- Facilities and sports support reload-safe custom grouping.
- Admission section supports repeatable admission coordinators.
- Contact section supports repeatable labelled phone numbers and dynamic social media links.
- Fee structure supports early childhood, pre-primary, class 1–5, class 6–8, class 9–10, and class 11–12 buckets.
- Board results use repeatable rows with `classLevel` and `passPercent`.
- Gallery/logo/cover uploads are handled through Cloudinary.
- Manual latitude/longitude entry takes priority over automatic locality/address geocoding.
- Inquiry management with lead statuses: `NEW`, `CONTACTED`, `INTERESTED`, `CONVERTED`, and `CLOSED`.
- Monthly lead count/stat from existing inquiry data.

### Platform Administrator Features

- Hidden admin login route.
- Admin dashboard with platform stats.
- School moderation: approve, reject, edit, delete, list/unlist, and feature/unfeature schools.
- Featured listing control through `isFeatured` and `featuredUntil`.
- User management for school admins, parents, and admins.
- FULL_ACCESS admins can edit a user's name, email, phone, and password.
- Email or password changes force the edited user to log in again on every device through the backend `tokenVersion` mechanism.
- Access levels: `READ_ONLY`, `READ_WRITE`, and `FULL_ACCESS`.
- Super admin support with DB-only creation and protection from delete, role change, status change, and access-level changes.
- Add school, add parent, and add admin flows.
- Cross-school inquiry monitoring.
- Admin audit logs for sensitive actions.

### Backend and System Features

- Stateless REST API built with Express.js and TypeScript.
- Prisma ORM with PostgreSQL/Neon.
- JWT authentication with role-based authorization.
- Separate role flows for Parent, School Admin, and Admin.
- Admin access-level guards and super admin protection.
- Brute-force login protection.
- Rate limiting for general requests, auth, forgot password, reset password, OTP, contact, and inquiry flows.
- Zod validation and request sanitization.
- Public school list, detail, search, city/state/board, featured, locality, and nearby APIs.
- `managementType` support in public school list responses and homepage browse filters.
- Full 22-section school profile validation and persistence.
- JSON persistence for facilities/sports custom groups, admission coordinators, additional phones, and social links.
- Contact submission model and API endpoint.
- Inquiry status workflow and lead tracking.
- In-memory cache for public school data and admin stats, with invalidation after mutations.
- Sentry capture for unexpected errors, startup issues, health check failures, unhandled rejections, and uncaught exceptions.
- Frontend handles Cloudinary uploads; backend stores URL strings only.

---

## Location and Nearby Discovery

Lakshya One supports two location-based discovery flows.

### Near Me Search

- User clicks the Near Me option on the school listing page.
- Browser asks for location permission.
- The frontend sends `lat`, `lng`, and selected `radius` to the public nearby API.
- Backend returns approved and visible schools within the selected radius.
- Allowed radius values are `1`, `2`, `3`, `5`, `8`, and `10` km.
- Default radius is `5` km.
- Near Me is treated as a standalone search mode instead of being combined with other listing filters.

### Locality Autocomplete

- User types a locality or address-like term.
- Suggestions are fetched from the backend after a short debounce.
- Locality-column matches are prioritized.
- Address fallback suggestions are used when a school does not have a separate locality value.
- Selecting a suggestion applies the `locality` filter to the school listing page.
- Homepage also provides a locality search entry point that navigates to the school listing page.

### Locality-Level Geocoding

Manual coordinate entry for every school is not realistic at MVP scale, so the backend uses locality-level geocoding.

- `School.locality` stores the locality or mohalla value.
- `LocalityCoordinate` caches geocoded locality/city/state combinations.
- Automatic geocoding runs asynchronously after school create/update so profile save is not blocked.
- Manual coordinates always win.
- If locality geocoding fails, backend can try address geocoding.
- If address geocoding fails, backend can fall back to city-level coordinates and mark them approximate.
- Existing schools can be backfilled through the backend backfill script.

### Known Location Follow-ups

- Verify that Near Me clears all regular filter params when activated, so Near Me and regular filters remain mutually exclusive in both directions.
- If not already applied, verify the locality filter matches both `locality` and `address`, because autocomplete can suggest address text when `locality` is missing.
- Add `locality` and `coordinatesApproximate` to any remaining frontend type definitions where needed.
- Review schools with empty or invalid address data because they cannot be reliably geocoded.
- Consider showing `coordinatesApproximate` in the admin UI later so admins know which coordinates need manual review.

---

## Location Fields Consolidation

Location-related profile fields were previously split across Basic Info and Contact. This was confusing because location appeared in two different sections of the 22-section school profile form.

The UI is now consolidated:

| Field | Current Form Section | Backend Field |
|---|---|---|
| Locality / Mohalla | Section 1 — Basic Info | `locality` |
| City | Section 1 — Basic Info | `city` |
| State | Section 1 — Basic Info | `state` |
| Full Address | Section 1 — Basic Info | `address` |
| Google Maps Embed URL | Section 1 — Basic Info | `mapUrl` |
| Latitude | Section 1 — Basic Info | `latitude` |
| Longitude | Section 1 — Basic Info | `longitude` |

No backend/schema/API change was required for this refactor. The frontend form still flattens these values into the same top-level payload keys expected by the backend. Existing database columns remain unchanged.

Validation notes:

- Latitude and longitude are optional.
- Empty latitude/longitude values do not block form submission.
- Latitude validates only when entered and must be between `-90` and `90`.
- Longitude validates only when entered and must be between `-180` and `180`.
- Manual coordinates continue to take priority over locality/address geocoding.

---

## Main User Routes

| Route | Purpose |
|---|---|
| `/` | Lakshya One homepage |
| `/schools` | Public school listing with filters, locality search, and Near Me mode |
| `/schools/[slug]` | Public school detail page |
| `/schools/city/[city]` | Dynamic city SEO page |
| `/schools/state/[state]` | Dynamic state SEO page |
| `/schools/board/[board]` | Dynamic board SEO page |
| `/compare` | Compare up to 3 schools |
| `/ai-recommend` | AI recommendation placeholder |
| `/about` | About page |
| `/contact` | Contact page |
| `/login` | Parent login |
| `/register` | Parent registration |
| `/forgot-password` | OTP password reset |
| `/school-login` | School admin login |
| `/school-register` | School admin registration |
| `/parent/*` | Parent dashboard |
| `/dashboard/school/*` | School admin dashboard |
| `/admin/*` | Platform admin panel |
| `/admin-login` | Hidden admin login |

---

## Main Backend API Areas

| Prefix | Purpose | Auth |
|---|---|---|
| `/health`, `/ready` | Health and readiness checks | Public |
| `/api/auth` | Register, login, logout, OTP, password reset, profile, Google sync | Mixed |
| `/api/schools` | Public school discovery, detail, search, localities, nearby, school CRUD, profile persistence | Mixed |
| `/api/admin` | Stats, moderation, users, featured listings, visibility, account editing | Admin |
| `/api/inquiries` | Parent inquiries and school/admin lead status updates | Parent / School / Admin |
| `/api/parent` | Parent profile, favourites, and inquiries | Parent |
| `/api/favourites` | Legacy favourites API | Parent |
| `/api/contact` | Public contact form submission | Public |

Full API details should stay in Backend.md.

---

## Authentication Model

Lakshya One uses role-separated flows instead of one shared login screen.

| Role | Login Route | Main Area | Session / Token Model |
|---|---|---|---|
| `PARENT` | `/login` | `/parent` | NextAuth session + backend JWT |
| `SCHOOL_ADMIN` | `/school-login` | `/dashboard/school` | NextAuth session + backend JWT |
| `ADMIN` | `/admin-login` | `/admin` | HTTP-only admin token cookie + admin session |

Backend JWT payload includes user ID, role, email, token ID, and token version. Admin tokens also include access level and super admin status. Sensitive permissions are always enforced again on the backend.

### Forced Session Invalidation

When a FULL_ACCESS admin changes another user's email or password, the backend increments that user's `tokenVersion`. Any previously issued JWT for that user becomes invalid on the next authenticated request, forcing re-login across devices.

---

## Environment Setup

### Frontend Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXTAUTH_URL` / `AUTH_URL` | NextAuth site URL |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | NextAuth session secret |
| `AUTH_TRUST_HOST` | Trust host setting for deployment |
| `JWT_SECRET` | Must match backend JWT secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Parent Google OAuth |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Contact form EmailJS service |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Contact form EmailJS template |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Contact form EmailJS public key |
| `NEXT_PUBLIC_CONTACT_SHEET_URL` | Google Sheets webhook URL |
| `NEXT_PUBLIC_SENTRY_DSN` | Frontend Sentry DSN |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload token |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry frontend project slug |

The frontend must not use `DATABASE_URL`.

### Backend Environment Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Backend port; default `4000` |
| `DATABASE_URL` | Neon/PostgreSQL connection string |
| `JWT_SECRET` | API token signing secret; must match frontend |
| `JWT_EXPIRES_IN` | Backend token lifetime |
| `FRONTEND_URL` | CORS allowlist |
| `BREVO_API_KEY` | Brevo email OTP sender key |
| `EMAIL_FROM` | Verified Brevo sender email |
| `FAST2SMS_API_KEY` | Fast2SMS OTP provider key |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin seeder values |
| `SUPER_ADMIN_EMAIL` | Super admin seeder email |
| `BCRYPT_ROUNDS` | Password hash cost |
| `TRUST_PROXY` | Production proxy setting |
| `SENTRY_DSN` | Backend Sentry DSN |

Important: Brevo email delivery requires a valid/verified sender setup. The code can be implemented correctly, but production email sending depends on provider verification.

---

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npm run migrate:dev
npm run dev
```

Backend runs at:

```txt
http://localhost:4000
```

Health check:

```txt
GET http://localhost:4000/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:3000
```

### Admin Seed Commands

```bash
cd backend
npm run seed:admin
npm run seed:super-admin
```

Use the hidden admin login route after seeding admin credentials.

---

## Database and Prisma Workflow

Run Prisma commands from the backend project.

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

For production:

```bash
npx prisma migrate deploy
```

Important rules:

- Do not run destructive reset commands unless data loss is intentional.
- After schema changes, regenerate the Prisma client.
- Keep frontend enum/type definitions aligned with backend Prisma enums.
- Keep the school profile form, backend validator, controller payload mapping, query layer, and database schema in sync.

Latest database/profile areas include:

- Admin access levels and super admin protection.
- Admin audit logs.
- Contact submissions.
- Featured listing fields.
- Inquiry lead statuses.
- School coordinates.
- 22-section school profile fields.
- Custom facility/sports groups.
- Admission coordinators and additional phones.
- Medium Other and State Board name support.
- Social links.
- Early childhood fee bucket.
- User `tokenVersion` for forced session invalidation.
- School locality, approximate coordinate flag, and locality-coordinate cache.

---

## Build and Type Check

### Frontend

```bash
cd frontend
npm run build
npx tsc --noEmit
```

### Backend

```bash
cd backend
npm run build
npx tsc --noEmit
```

After Prisma schema changes:

```bash
cd backend
npx prisma generate
```

---

## Deployment

### Frontend Deployment

Recommended target: Vercel.

Deployment notes:

- Set the frontend root as the frontend app.
- Build command: `npm run build`.
- Add all required frontend environment variables.
- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- Keep `JWT_SECRET` identical to the backend value.
- Add the correct Google OAuth callback URL for the production domain.

### Backend Deployment

Recommended target: Render.

Typical commands:

```bash
npm ci && npx prisma generate && npm run build
npx prisma migrate deploy
npm start
```

Deployment notes:

- Health check path: `/health`.
- Set `FRONTEND_URL` to the exact frontend production domain.
- Add `DATABASE_URL`, JWT, Brevo, Fast2SMS, and Sentry values in the backend environment.
- Run migrations before starting the production server.

---

## Security and Reliability

| Area | Current Implementation |
|---|---|
| Authentication | NextAuth + backend JWT |
| Authorization | Backend role guards and admin access-level guards |
| Admin protection | Hidden admin login, super admin rules, audit logs |
| Session invalidation | `tokenVersion` check on authenticated backend requests |
| Rate limits | General, auth, forgot password, reset password, OTP, contact, inquiry |
| Spam protection | Duplicate inquiry checks, phone/email/IP limits, honeypot fields |
| Upload safety | MIME check, file size limit, magic-byte validation, server-side Cloudinary credentials |
| CORS | Restricted by `FRONTEND_URL` |
| Security headers | Backend Helmet and frontend security headers |
| Error monitoring | Sentry on frontend and backend |
| Data access | Frontend has no direct database access |
| Profile data safety | Zod validation, sanitization, and controlled Prisma writes |
| Location safety | Manual coordinates optional; geocoding is approximate and non-blocking |

---

## Current Pending / Follow-Up Items

These are not blockers for the already implemented core platform, but they should be tracked:

- Blog CMS is intentionally skipped for now.
- Razorpay payment flow is future-only.
- Reviews system is future-only.
- Real AI school recommendation is future-only; current route is only a placeholder.
- Direct WhatsApp routing is future-only.
- Production Brevo email sending depends on verified sender/domain setup.
- Confirm the locality filter matches both `locality` and `address` when address fallback suggestions are selected.
- Confirm Near Me fully clears regular filters when activated.
- Clean invalid or empty school address data so geocoding can work reliably.
- Add `coordinatesApproximate` visibility to admin UI later if needed.
- Consider switching from free Nominatim to a paid/self-hosted geocoding option if traffic grows heavily.

---

## Documentation Maintenance Rules

- Update README after major feature, workflow, deployment, or environment changes.
- Keep Frontend.md updated after frontend route, component, auth, upload, SEO, or UI-flow changes.
- Keep Backend.md updated after backend route, schema, controller, middleware, validation, cache, or security changes.
- Keep Future-Features.md updated for skipped or deferred modules.
- Do not commit secrets, `.env`, `.env.local`, generated Prisma client output, or provider keys.
- Keep `JWT_SECRET` identical across frontend and backend.
- Run build and type-check before deployment.
- For backend schema changes, create a migration and regenerate the Prisma client.

---

**Lakshya One** — a practical school discovery, comparison, inquiry, and lead-management platform for Indian parents, schools, and platform administrators.
