# Secret Santa

A modern Secret Santa web application built with React, TypeScript, and Cloudflare Workers with D1 database.

## 📸 Screenshots

<!-- TODO: Add screenshots here -->

### Home Page

<img width="632" height="901" alt="Home Page" src="https://github.com/user-attachments/assets/91cfc999-67ff-4ce0-9a67-5a781145cfa2" />

### Admin Dashboard

<img width="1237" height="631" alt="Rooms Overview" src="https://github.com/user-attachments/assets/7e60d18a-e1d2-4dc7-8494-41f372b2928e" />

### Room Admin

<img width="874" height="864" alt="Room Admin" src="https://github.com/user-attachments/assets/2f892f26-5f33-49f3-9eac-74689b0fad43" />

### Participant View

<img width="857" height="799" alt="Participant View 1" src="https://github.com/user-attachments/assets/c8208e63-94b3-4cbd-a3bb-e086b9cd9bc9" />

<img width="1149" height="738" alt="Participant View 2" src="https://github.com/user-attachments/assets/b7e35222-d8a2-4bb3-b6d1-ad43efed7f87" />

<img width="1078" height="769" alt="Participant View 3" src="https://github.com/user-attachments/assets/1856543e-d627-496c-9dcd-422c6894df0a" />

## ✨ Features

-   🎅 Create and manage Secret Santa rooms
-   🎁 Set price limits and currency preferences
-   🌍 Multi-language support (English, German)
-   🎨 Beautiful Christmas-themed UI with animations
-   🔒 Secure participant tokens
-   📱 Responsive design
-   ⚡ Fast edge computing with Cloudflare Workers
-   🗄️ SQLite database (D1) for data persistence

## 🏗️ Architecture

-   **Frontend**: React + TypeScript + Vite
-   **Backend**: Cloudflare Workers
-   **Database**: Cloudflare D1 (SQLite)
-   **UI**: Custom shadcn/ui components with Tailwind CSS
-   **Routing**: React Router (Hash routing for SPA)
-   **State Management**: TanStack Query (React Query)

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+ and pnpm
-   Cloudflare account (free tier works)
-   Wrangler CLI (installed via pnpm)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Cloudflare D1 Database

Create the database locally for development:

```bash
wrangler d1 create secret-santa-db
```

This will output a database ID. Copy it and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "secret-santa-db",
    "database_id": "YOUR_DATABASE_ID_HERE"  // Replace with your ID
  }
]
```

Apply the database schema:

```bash
wrangler d1 execute secret-santa-db --local --file=./schema.sql
```

### 3. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

### 4. Deploy to Production

First, create the production database:

```bash
wrangler d1 create secret-santa-db
```

Update `wrangler.jsonc` with the production database ID (if different), then apply the schema:

```bash
wrangler d1 execute secret-santa-db --file=./schema.sql
```

Build and deploy:

```bash
pnpm deploy
```

## 📁 Project Structure

```
secret-santa/
├── src/
│   ├── api/
│   │   └── apiClient.ts          # Custom API client
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── select.tsx
│   │   └── participant/             # Feature-specific components
│   │       ├── ChristmasReveal.tsx
│   │       └── WishesStep.tsx
│   ├── pages/                       # Page components
│   │   ├── Home.tsx                 # Landing page
│   │   ├── AdminDashboard.tsx       # Admin view of all rooms
│   │   ├── RoomAdmin.tsx            # Room management
│   │   └── Participant.tsx          # Participant view
│   ├── types/
│   │   └── entities.ts              # TypeScript type definitions
│   ├── utils/
│   │   └── index.ts                 # Utility functions
│   ├── lib/
│   │   └── utils.ts                 # UI utility functions (cn)
│   ├── App.tsx                      # Main app with routing
│   └── main.tsx                     # Entry point
├── worker/
│   └── index.ts                     # Cloudflare Worker API endpoints
├── schema.sql                       # D1 database schema
├── wrangler.jsonc                   # Cloudflare configuration
└── package.json
```

## 🔌 API Endpoints

The Cloudflare Worker provides the following REST API endpoints:

### Rooms

-   `GET /api/rooms` - List all rooms (supports filtering by `admin_token`)
-   `POST /api/rooms` - Create a new room
-   `PATCH /api/rooms/:id` - Update a room

### Assignments

-   `GET /api/assignments` - List assignments (supports filtering by `room_id` or `participant_token`)
-   `POST /api/assignments` - Create a single assignment
-   `POST /api/assignments/bulk` - Create multiple assignments
-   `PATCH /api/assignments/:id` - Update an assignment

## 🗄️ Database Schema

### Rooms Table

-   `id` (TEXT, PRIMARY KEY)
-   `room_name` (TEXT)
-   `participant_names` (TEXT/JSON)
-   `price_limit` (REAL)
-   `currency` (TEXT)
-   `language` (TEXT)
-   `is_drawn` (INTEGER/BOOLEAN)
-   `admin_token` (TEXT, UNIQUE)
-   `created_date` (TEXT)

### Assignments Table

-   `id` (TEXT, PRIMARY KEY)
-   `room_id` (TEXT, FOREIGN KEY)
-   `participant_name` (TEXT)
-   `drawn_name` (TEXT)
-   `participant_token` (TEXT, UNIQUE)
-   `wishes` (TEXT/JSON)
-   `has_viewed` (INTEGER/BOOLEAN)

## 🛠️ Common Commands

### Database Operations (Local)

```bash
# List all rooms
wrangler d1 execute secret-santa-db --local --command="SELECT * FROM rooms;"

# List all assignments
wrangler d1 execute secret-santa-db --local --command="SELECT * FROM assignments;"

# Clear all data (careful!)
wrangler d1 execute secret-santa-db --local --command="DELETE FROM assignments; DELETE FROM rooms;"

# Reset database
wrangler d1 execute secret-santa-db --local --file=./schema.sql
```

### Database Operations (Production)

```bash
# List all rooms (remove --local flag)
wrangler d1 execute secret-santa-db --command="SELECT * FROM rooms;"

# Apply schema to production
wrangler d1 execute secret-santa-db --file=./schema.sql
```

### Development

```bash
# Start dev server (includes worker and assets)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Cloudflare
pnpm deploy

# Generate Cloudflare types
pnpm cf-typegen
```

## 🔧 Implementation Details

### Custom API Client

The project uses a custom API client (`apiClient.ts`) that provides a simple interface for interacting with the backend:

```typescript
import { api } from "@/api/apiClient";

// Create a room
await api.entities.Room.create({
  room_name: "My Secret Santa",
  participant_names: ["Alice", "Bob", "Charlie"],
  price_limit: 50,
  currency: "EUR",
  language: "en"
});

// Filter rooms by admin token
const rooms = await api.entities.Room.filter({ admin_token: token });

// Bulk create assignments
await api.entities.Assignment.bulkCreate([
  { room_id, participant_name: "Alice", drawn_name: "Bob", ... },
  { room_id, participant_name: "Bob", drawn_name: "Charlie", ... }
]);
```

### Type Safety

Full TypeScript support with proper type definitions:

```typescript
interface Room {
    id: string;
    room_name: string;
    participant_names: string[];
    price_limit: number;
    currency: "EUR" | "USD" | "GBP" | "CHF";
    language: "de" | "en";
    is_drawn: boolean;
    admin_token: string;
    created_date?: string;
}
```

### UI Components

All UI components are based on shadcn/ui and support Tailwind CSS:

-   **Button** - Multiple variants (default, destructive, outline, etc.)
-   **Card** - Container with header, content, and footer sections
-   **Input** - Styled form input with proper focus states
-   **Label** - Form label using Radix UI primitives
-   **Select** - Dropdown with keyboard navigation

### Routing

The app uses Hash routing for SPA compatibility with Cloudflare:

```typescript
// Utility function for generating URLs
const url = createPageUrl("Room Admin", { roomId, adminToken });

// Routes
// - / (Home)
// - /admin (Admin Dashboard)
// - /room (Room Admin)
// - /participant (Participant View)
```

## 🐛 Troubleshooting

### Database not found error

Make sure you've created the D1 database and applied the schema:

```bash
wrangler d1 execute secret-santa-db --local --file=./schema.sql
```

### API 404 errors

Ensure the Cloudflare Worker is running. In development mode, the worker is automatically started with `pnpm dev`.

### TypeScript path errors

Ensure `tsconfig.app.json` has the correct path mappings for `@/*` imports.

### Worker errors during development

Check the terminal where you ran `pnpm dev` - worker logs appear there. For deployed workers, check the Cloudflare dashboard.

### Can't connect to database

```bash
# Check if database exists
wrangler d1 list

# Re-apply schema if needed
wrangler d1 execute secret-santa-db --local --file=./schema.sql
```

## 📝 Migration Notes

This project was originally scaffolded with a different backend system and has been migrated to use Cloudflare D1. Key changes include:

-   **No external SDK dependency** - Complete control over the backend
-   **Cloudflare native** - Uses D1 database directly
-   **Type-safe** - Full TypeScript support throughout
-   **Better performance** - No SDK overhead, optimized for edge computing
-   **More control** - Custom error handling, validation, and business logic

The custom API client maintains a familiar interface, so minimal changes were needed to the page components during migration.

## 🌟 Features in Detail

### Room Management

-   Create rooms with custom names and settings
-   Set price limits and currency preferences
-   Choose language (English or German)
-   Manage multiple participants
-   Secure admin access via tokens

### Drawing System

-   Automated Secret Santa drawing
-   Ensures no one draws themselves
-   Generates unique participant tokens
-   Prevents duplicate assignments

### Participant Experience

-   Access via secure token link
-   View assigned person
-   Add gift wishes
-   Beautiful Christmas-themed reveal animation
-   Mark wishes as viewed

### Admin Features

-   View all rooms from admin dashboard
-   Monitor participant activity
-   Track who has viewed their assignments
-   Manage room settings

## 🔗 Useful Links

-   [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
-   [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
-   [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
-   [React Router Documentation](https://reactrouter.com/)
-   [TanStack Query Documentation](https://tanstack.com/query/latest)
-   [shadcn/ui Documentation](https://ui.shadcn.com/)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
