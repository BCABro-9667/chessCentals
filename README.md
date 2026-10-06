# Chessmate Central

Chessmate Central is a full-stack chess tournament platform built with Next.js.  
It includes a public frontend for tournaments and blog content, plus an organizer dashboard for tournament operations, registrations, and result management.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
  - [Frontend Features](#frontend-features)
  - [Backend Features](#backend-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run the App](#run-the-app)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Authentication Model](#authentication-model)
- [Data Models](#data-models)
- [AI Integration](#ai-integration)
- [Notes for Production](#notes-for-production)

---

## Overview

Chessmate Central helps organizers:

- create and manage tournaments,
- register players and track payment status,
- enter round-by-round results with live standings,
- publish and manage chess blog/news posts.

It also serves public users with:

- tournament browsing and detail pages,
- public player registration,
- results/standings visibility,
- blog listing and single-post reading.

---

## Core Features

### Frontend Features

### Public website
- Home page with highlights for tournaments and latest blog posts.
- Public tournaments list with status-based sorting.
- Public tournament detail page with:
  - tournament information,
  - player registration form,
  - registered players list,
  - standings/results table when available.
- Public blog list and blog detail pages.

### Organizer experience
- Organizer registration and login pages.
- Protected dashboard routes (`/dashboard/*`) with redirect to login when unauthenticated.
- Dashboard overview with tournaments grouped by status:
  - Upcoming,
  - Active,
  - Completed,
  - Cancelled.
- Tournament actions:
  - create,
  - edit,
  - delete,
  - status transitions (Upcoming/Active/Completed),
  - view public page.
- Player management:
  - add player registrations,
  - edit player records,
  - delete registrations,
  - toggle fee-paid status,
  - copy registration data for spreadsheet use.
- Result management:
  - set per-round score (`1`, `0.5`, `0`, `not played`),
  - automatic total score updates,
  - automatic standings updates and persistence.
- Blog management:
  - create post,
  - edit post,
  - delete post,
  - manage slug/category/tags/image URL/content.

### UX and UI
- Built with Tailwind CSS + shadcn/ui component patterns.
- Toast notifications across key actions.
- Skeleton loaders for async content.
- Dark/light theme toggle with persisted preference.
- Responsive navigation with mobile drawer/sheet.

### Backend Features

### API routes (Next.js Route Handlers)
- Tournament CRUD (`/api/tournaments`, `/api/tournaments/[id]`).
- Player registration CRUD + tournament-scoped listing.
- Tournament results fetch/upsert by tournament id.
- Organizer auth endpoints (`register`, `login`, `logout`).
- Blog routes for public reads and admin post management.
- Local file upload endpoint for payment screenshots (`/api/upload`).

### Database integration
- MongoDB connection utility with collection helpers for:
  - tournaments,
  - player registrations,
  - tournament results,
  - blog posts,
  - users.
- ObjectId mapping to string `id` fields for frontend use.

### Validation and business rules
- Required field checks and typed payload handling in API handlers.
- Password hashing with `bcryptjs`.
- Slug uniqueness enforcement for blog posts.
- Tournament creation defaults to `Upcoming` status.
- Results endpoint supports upsert behavior.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS, shadcn/ui, Radix UI primitives
- **Database:** MongoDB (native Node driver)
- **Auth (current implementation):** API credential checks + client localStorage session state
- **AI:** Genkit + Google AI plugin for tournament description generation
- **Utilities:** date-fns, zod, react-hook-form

---

## Project Structure

```text
src/
  app/
    api/                      # Backend route handlers
    blog/                     # Public blog pages
    dashboard/                # Organizer dashboard pages
    tournaments/              # Public tournament pages
    login, register           # Auth pages
  components/                 # UI, forms, cards, layout, modals
  hooks/                      # Data and state hooks
  lib/                        # MongoDB + utility modules
  types/                      # Shared domain types
  ai/                         # Genkit setup and AI flows
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- MongoDB connection string

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the repository root:

```env
MONGO_URI=your_mongodb_connection_string
```

For AI flow usage, also provide your Google AI key required by Genkit Google AI plugin.

### Run the App

```bash
npm run dev
```

The app runs on:

- `http://localhost:9002`

---

## Available Scripts

- `npm run dev` – Start Next.js dev server (Turbopack) on port `9002`.
- `npm run build` – Create production build.
- `npm run start` – Start production server.
- `npm run lint` – Run Next.js linting.
- `npm run typecheck` – Run TypeScript type checking.
- `npm run genkit:dev` – Run Genkit flow server.
- `npm run genkit:watch` – Run Genkit flow server in watch mode.

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Tournaments
- `GET /api/tournaments`
- `POST /api/tournaments`
- `GET /api/tournaments/[id]`
- `PUT /api/tournaments/[id]`
- `DELETE /api/tournaments/[id]`

### Registrations
- `POST /api/registrations`
- `GET /api/registrations/by-tournament/[tournamentId]`
- `PUT /api/registrations/[registrationId]`
- `DELETE /api/registrations/[registrationId]`

### Results
- `GET /api/results/[tournamentId]`
- `POST /api/results/[tournamentId]`

### Blog
- `GET /api/blog/posts`
- `POST /api/blog/posts`
- `GET /api/blog/posts/[slug]`
- `GET /api/admin/blog/[id]`
- `PUT /api/admin/blog/[id]`
- `DELETE /api/admin/blog/[id]`

### Upload
- `POST /api/upload`

---

## Authentication Model

Current auth flow:

- user credentials are validated server-side via API routes and stored user records,
- password hashes are stored in MongoDB,
- login state is maintained on the client using localStorage keys,
- dashboard routes are client-guarded and redirect to `/login` when not authenticated.

This is suitable for development/demo but should be replaced with robust server-side session/JWT auth for production.

---

## Data Models

Primary domain models:

- `Tournament`
- `PlayerRegistration`
- `TournamentResult` / `PlayerScore`
- `BlogPost`
- `UserDocument`

Model definitions are available under `src/types`.

---

## AI Integration

The app includes AI-assisted tournament description generation:

- flow file: `src/ai/flows/generate-tournament-description.ts`
- used in tournament form (`Generate with AI` action)
- configured via Genkit in `src/ai/genkit.ts`

---

## Notes for Production

- Replace localStorage session handling with secure server-side authentication.
- Add authorization checks for ownership-sensitive endpoints.
- Move file uploads to a dedicated cloud storage provider.
- Keep TypeScript and ESLint build checks enabled in production pipelines.
