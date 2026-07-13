# GharBaar — Rental Management SaaS (Phase 1)

A MERN-stack (MongoDB, Express, React, Node.js) rental property management app for landlords: properties, tenants, lease agreements, monthly billing (rent + electricity + dues), rent collection, expense tracking, maintenance tickets, and reports.

This is the Phase 1 "Rental Management SaaS" scope of the broader GharBaar vision (a rental property operating system for India). Later phases (marketplace, tenant trust score, digital verification, rental mobility, property finance) are out of scope for this build.

The original version of this project was a single static HTML invoice generator (CodePen export, UPI QR + download-as-image). It has been archived at `legacy/static-invoice-generator/` and its invoice logic was ported into the `client/src/features/billing` module, now backed by real data instead of a static form.

## Stack

- **Frontend**: React 18 (JSX, no TypeScript) + Vite, React Router, TanStack Query, Axios
- **Backend**: Node.js + Express, Mongoose (MongoDB)
- **Auth**: JWT (email + password, bcrypt-hashed), roles: landlord / tenant / admin

## Getting started

```bash
npm run install:all       # installs server + client deps
cp server/.env.example server/.env   # fill in MONGODB_URI and JWT_SECRET
cp client/.env.example client/.env
npm run dev                # runs server (:5000) and client (:5173) together
```

## Project layout

- `server/` — Express API (routes → controllers → services → Mongoose models)
- `client/` — React app (pages, feature modules, shared components)
- `legacy/` — archived original static invoice generator (reference only)
