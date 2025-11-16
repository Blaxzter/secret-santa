-- Cloudflare D1 Database Schema for Secret Santa

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  room_name TEXT NOT NULL,
  participant_names TEXT NOT NULL, -- JSON array stored as text
  price_limit REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  language TEXT NOT NULL DEFAULT 'de',
  is_drawn INTEGER NOT NULL DEFAULT 0, -- Boolean stored as integer (0 or 1)
  admin_token TEXT NOT NULL UNIQUE,
  created_date TEXT NOT NULL
);

-- Index for faster admin token lookups
CREATE INDEX IF NOT EXISTS idx_rooms_admin_token ON rooms(admin_token);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  drawn_name TEXT NOT NULL,
  participant_token TEXT NOT NULL UNIQUE,
  wishes TEXT NOT NULL DEFAULT '[]', -- JSON array stored as text
  has_viewed INTEGER NOT NULL DEFAULT 0, -- Boolean stored as integer (0 or 1)
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_assignments_room_id ON assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_assignments_participant_token ON assignments(participant_token);
