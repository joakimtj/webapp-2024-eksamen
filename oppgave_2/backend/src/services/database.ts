import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';

const db = new Database('app.db');

export interface Template {
    id: string;
    name: string;
    event_type: string;
    default_capacity: number;
    default_price: number;
    rules: string;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    event_type: string;
    date: string;
    location: string;
    capacity: number;
    price: number | null;
    created_at: string;
    updated_at: string;
}

export class AppDB {
    constructor() {
        this.initDB();
    }

    private initDB() {
        db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        event_type TEXT NOT NULL,
        default_capacity INTEGER,
        default_price DECIMAL(10,2),
        rules TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        price DECIMAL(10,2),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT REFERENCES events(id),
        status TEXT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendees (
        id TEXT PRIMARY KEY,
        registration_id TEXT REFERENCES registrations(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL
      );
    `);
    }

    getAllEvents(): Event[] {
        return db.prepare('SELECT * FROM events ORDER BY date').all() as Event[];
    }

    getEventBySlug(slug: string): Event | null {
        return db.prepare('SELECT * FROM events WHERE slug = ?').get(slug) as Event | null;
    }
}