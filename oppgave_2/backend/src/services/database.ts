import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type { Event, Template, Registration, Attendee, UpdateEventData, EventFilters, CreateRegistrationData, CreateAttendeeData } from '../types/models';

const db = new Database('app.db');

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

    getEventById(id: string): Event | null {
        return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | null;
    }

    getAllEvents(filters?: EventFilters): Event[] {
        let query = 'SELECT * FROM events';
        const params: any[] = [];
        const conditions: string[] = [];

        if (filters) {
            if (filters.month !== undefined) {
                conditions.push("strftime('%m', date) = ?");
                params.push(filters.month.toString().padStart(2, '0'));
            }

            if (filters.year !== undefined) {
                conditions.push("strftime('%Y', date) = ?");
                params.push(filters.year.toString());
            }

            if (filters.event_type) {
                conditions.push('event_type = ?');
                params.push(filters.event_type);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
        }

        query += ' ORDER BY date';

        console.log('Query:', query, 'Params:', params); // For debugging
        return db.prepare(query).all(params) as Event[];
    }

    getEventBySlug(slug: string): Event | null {
        return db.prepare('SELECT * FROM events WHERE slug = ?').get(slug) as Event | null;
    }

    deleteEvent(id: string): boolean {
        const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);
        return result.changes > 0;
    }

    updateEvent(id: string, data: UpdateEventData): Event | null {
        const current = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Event | null;
        if (!current) return null;

        const updates = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .map(([key, _]) => `${key} = @${key}`)
            .join(', ');

        const now = new Date().toISOString();
        const result = db.prepare(`
          UPDATE events 
          SET ${updates}, updated_at = @updated_at
          WHERE id = @id
          RETURNING *
        `).get({ ...data, id, updated_at: now });

        return result as Event;
    }

    replaceEvent(id: string, event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event | null {
        const now = new Date().toISOString();
        const result = db.prepare(`
          UPDATE events 
          SET title = @title,
              description = @description,
              event_type = @event_type,
              date = @date,
              location = @location,
              capacity = @capacity,
              price = @price,
              updated_at = @updated_at
          WHERE id = @id
          RETURNING *
        `).get({ ...event, id, updated_at: now });

        return result as Event;
    }

    // Templates
    getAllTemplates(): Template[] {
        return db.prepare('SELECT * FROM templates').all() as Template[];
    }

    getTemplateById(id: string): Template | null {
        return db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as Template | null;
    }

    deleteTemplate(id: string): boolean {
        const result = db.prepare('DELETE FROM templates WHERE id = ?').run(id);
        return result.changes > 0;
    }

    updateTemplate(id: string, data: Partial<Template>): Template | null {
        const updates = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .map(([key, _]) => `${key} = @${key}`)
            .join(', ');

        const now = new Date().toISOString();
        return db.prepare(`
      UPDATE templates 
      SET ${updates}, updated_at = @updated_at
      WHERE id = @id
      RETURNING *
    `).get({ ...data, id, updated_at: now }) as Template;
    }

    // Registrations
    getAllRegistrations(): Registration[] {
        return db.prepare('SELECT * FROM registrations').all() as Registration[];
    }

    getRegistrationById(id: string): Registration | null {
        return db.prepare('SELECT * FROM registrations WHERE id = ?').get(id) as Registration | null;
    }

    getRegistrationsByEventId(eventId: string): Registration[] {
        return db.prepare('SELECT * FROM registrations WHERE event_id = ?').all(eventId) as Registration[];
    }

    deleteRegistration(id: string): boolean {
        const result = db.prepare('DELETE FROM registrations WHERE id = ?').run(id);
        return result.changes > 0;
    }

    updateRegistration(id: string, data: Partial<Registration>): Registration | null {
        const updates = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .map(([key, _]) => `${key} = @${key}`)
            .join(', ');

        const now = new Date().toISOString();
        return db.prepare(`
      UPDATE registrations 
      SET ${updates}, updated_at = @updated_at
      WHERE id = @id
      RETURNING *
    `).get({ ...data, id, updated_at: now }) as Registration;
    }

    createRegistration(data: CreateRegistrationData): Registration {
        const now = new Date().toISOString();
        const id = `reg_${nanoid()}`; // Using prefix for clarity

        const result = db.prepare(`
          INSERT INTO registrations (
            id,
            event_id,
            status,
            total_price,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `).get(
            id,
            data.event_id,
            data.status,
            data.total_price,
            now,
            now
        ) as Registration;

        return result;
    }

    // Attendees
    getAllAttendees(): Attendee[] {
        return db.prepare('SELECT * FROM attendees').all() as Attendee[];
    }

    getAttendeeById(id: string): Attendee | null {
        return db.prepare('SELECT * FROM attendees WHERE id = ?').get(id) as Attendee | null;
    }

    getAttendeesByRegistrationId(registrationId: string): Attendee[] {
        return db.prepare('SELECT * FROM attendees WHERE registration_id = ?').all(registrationId) as Attendee[];
    }

    deleteAttendee(id: string): boolean {
        const result = db.prepare('DELETE FROM attendees WHERE id = ?').run(id);
        return result.changes > 0;
    }

    updateAttendee(id: string, data: Partial<Attendee>): Attendee | null {
        const updates = Object.entries(data)
            .filter(([_, value]) => value !== undefined)
            .map(([key, _]) => `${key} = @${key}`)
            .join(', ');

        return db.prepare(`
      UPDATE attendees 
      SET ${updates}
      WHERE id = @id
      RETURNING *
    `).get({ ...data, id }) as Attendee;
    }

    createAttendee(data: CreateAttendeeData): Attendee {
        const now = new Date().toISOString();
        const id = `att_${nanoid()}`; // Using prefix for clarity

        const result = db.prepare(`
          INSERT INTO attendees (
            id,
            registration_id,
            name,
            email,
            phone,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?)
          RETURNING *
        `).get(
            id,
            data.registration_id,
            data.name,
            data.email,
            data.phone,
            now
        ) as Attendee;

        return result;
    }
}