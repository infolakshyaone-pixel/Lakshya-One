---

# July 2026

## 2026-07-22

### 🚀 New Features

#### Editable School Slug (Planned)
- Planned support for editing school slug from the School Profile form.
- Feature restricted to FULL_ACCESS/Admin users only.
- Backend validation planned for slug format and uniqueness.
- Confirmation dialog planned before saving slug changes.
- Existing URL redirect support intentionally deferred to a future release.

---

### ✨ Improvements

#### School Detail Page
- Improved location formatting across the School Detail page.
- Eliminated duplicate address information in multiple sections.
- Added reusable location builder to generate clean address strings.

#### Favourite Button
- Improved UI for hero section by introducing dark/light variants.
- Prevented layout shift by changing toast positioning.

#### Nearby Schools
- Improved school address display.
- Hidden empty board badges.
- Clarified distance calculation logic (based on current school's coordinates).

---

### ⚙️ Backend

#### Map-based Geocoding Improvements
- Added automatic coordinate extraction from Google Maps URLs.
- Added support for extracting coordinates from:
  - `!3d...!4d...`
  - `@lat,lng`
  - `?q=lat,lng`
  - `?ll=lat,lng`
- Added redirect resolution for shortened Google Maps links.
- Updated school create/update APIs to automatically populate coordinates from `mapUrl`.
- Manual coordinates now take priority over locality-based geocoding.

#### Distance Calculation
- Improved coordinate extraction priority.
- Exact place-pin coordinates are now preferred over viewport coordinates, significantly improving nearby-school distance accuracy.

#### Nearby Schools API
- Removed hardcoded database fetch limit.
- Made API limit optional.
- Nearby Schools now returns all schools within the selected radius when no explicit limit is provided.
- Increased maximum supported limit from 50 to 500.

---

### 🗄 Database

- Added new field:

```prisma
hasManualCoords Boolean @default(false)
```

- Existing data remains fully compatible.
- Prisma schema regenerated successfully.

---

### 🛠 Scripts

#### Coordinate Backfill Script
Created:

```
backend/src/scripts/backfill-maplink-coordinates.ts
```

Purpose:
- Extract exact coordinates from existing Google Maps URLs.
- Update latitude/longitude.
- Set `hasManualCoords = true`.
- Mark coordinates as non-approximate.

---

### 🎨 Frontend

#### School Detail Page
- Added reusable `buildLocationLine()` helper.
- Hero section now displays a cleaner address.
- Removed duplicate locality information.
- Sidebar contact card now displays a properly formatted address hierarchy.

#### Favourite Button
- Added support for:
  - `variant="dark"`
  - `variant="light"`
- Improved hero-section compatibility.

#### Nearby Schools Panel
- Hidden empty board badges.
- Improved address formatting.
- Better fallback handling for missing address components.

---

### 🔌 API Changes

Updated:
- `createSchool`
- `updateSchool`
- `getNearbySchools`

Changes:
- Automatic coordinate extraction from `mapUrl`
- Better nearby-school filtering
- Optional result limits
- Improved distance accuracy

---

### 🐞 Bug Fixes

- Fixed duplicate address rendering.
- Fixed blank board badge rendering.
- Fixed inaccurate nearby-school distances caused by viewport coordinates.
- Fixed nearby-school radius not increasing results.
- Fixed hardcoded frontend API limit.
- Fixed backend query limitation before distance filtering.
- Fixed Prisma TypeScript error caused by missing `hasManualCoords`.
- Improved Google Maps coordinate extraction accuracy.

---

### 📝 Documentation

Created development plan for:

- Editable School Slug
- Backend validation strategy
- Admin-only permissions
- Duplicate slug handling
- Confirmation dialog flow
- Future redirect support

---

### ⚠️ Pending Work

#### Editable School Slug
- Backend validator
- Duplicate slug check
- Admin-only UI
- Zod schema update
- Form mapping
- Confirmation dialog
- Manual testing

#### Favourite Button
- Pass `variant="dark"` in School Detail hero section.

---

### 📌 Notes

Today's work primarily focused on improving the School Detail page, geocoding accuracy, nearby-school distance calculations, API scalability, database enhancements, and planning the upcoming editable school slug feature.