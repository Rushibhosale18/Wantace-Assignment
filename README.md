# Northline Roofing & Exteriors - Config-Driven Estimator

A full-stack, configuration-driven web application for capturing roof replacement leads and calculating dynamic estimates securely on the backend.

## Architecture

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** SQLite with Prisma ORM
- **Authentication:** Basic Auth (for Owner Panel)

## Setup & Run Instructions

This project is structured as a monorepo containing `client` and `server` directories. It uses an embedded SQLite database, so you **do not** need to install or run PostgreSQL or MongoDB locally.

### 1. Prerequisites
- Node.js (v18.x or higher)
- npm

### 2. Backend Setup
Open a terminal and run the following commands:
```bash
cd server
npm install
npx prisma db push
npm run seed
npm start
```
The server will start on `http://localhost:3001`.

### 3. Frontend Setup
Open a new terminal tab/window and run the following commands:
```bash
cd client
npm install
npm run dev
```
The client will start (usually on `http://localhost:5173`). Open this URL in your browser.

## Environment Variables

The server requires a `.env` file in the `server` directory. It is already provided in the repository with the following default values for easy testing:
```
DATABASE_URL="file:./dev.db"
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=roofing2026!
```

## Admin Test Credentials

To access the Owner Panel (`http://localhost:5173/admin`):
- **Username:** `admin`
- **Password:** `roofing2026!`

## Features implemented

- **Dynamic Frontend:** ALL questions, options, and constraints are fetched from `/api/config`. Nothing is hardcoded in the UI.
- **Server-Side Pricing Engine:** Calculations happen securely on the backend, ensuring pricing logic is never exposed to the client.
- **Owner Panel:** Real-time updates to rates and questions that instantly reflect on the public estimator without a redeploy.
- **Persistent Data:** SQLite ensures changes to config and captured leads are reliably saved across restarts.
