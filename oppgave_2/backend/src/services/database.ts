import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import type { Event, Template, Registration, Attendee, UpdateEventData, EventFilters, CreateRegistrationData, CreateAttendeeData, FilterOptions, CreateEventData, CreateTemplateData } from '../types/models';

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

    createEvent(data: CreateEventData): Event {
        const now = new Date().toISOString();
        const id = `evt_${nanoid()}`;

        const result = db.prepare(`
          INSERT INTO events (
            id,
            slug,
            title,
            description,
            event_type,
            date,
            location,
            capacity,
            price,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `).get(
            id,
            data.slug,
            data.title,
            data.description,
            data.event_type,
            data.date,
            data.location,
            data.capacity,
            data.price,
            now,
            now
        ) as Event;

        return result;
    }

    deleteEvent(id: string): boolean {
        try {
            db.exec('BEGIN TRANSACTION');

            // Get all registrations for this event
            const registrations = db.prepare('SELECT id FROM registrations WHERE event_id = ?').all(id) as { id: string }[];

            // Delete each registration (which will also delete associated attendees)
            for (const reg of registrations) {
                this.deleteRegistration(reg.id, true);  // Pass true to indicate we're within a transaction
            }

            // Finally delete the event
            const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);

            db.exec('COMMIT');
            return result.changes > 0;
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
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

    createTemplate(data: CreateTemplateData): Template {
        const now = new Date().toISOString();
        const id = `tpl_${nanoid()}`; // Using prefix for clarity

        const result = db.prepare(`
          INSERT INTO templates (
            id,
            name,
            event_type,
            default_capacity,
            default_price,
            rules,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `).get(
            id,
            data.name,
            data.event_type,
            data.default_capacity,
            data.default_price,
            data.rules,
            now,
            now
        ) as Template;

        return result;
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

    deleteRegistration(id: string, withinTransaction: boolean = false): boolean {
        if (!withinTransaction) {
            try {
                db.exec('BEGIN TRANSACTION');

                // Delete all associated attendees first
                db.prepare('DELETE FROM attendees WHERE registration_id = ?').run(id);

                // Then delete the registration
                const result = db.prepare('DELETE FROM registrations WHERE id = ?').run(id);

                db.exec('COMMIT');
                return result.changes > 0;
            } catch (error) {
                db.exec('ROLLBACK');
                throw error;
            }
        } else {
            // When called within a transaction, just do the deletes
            db.prepare('DELETE FROM attendees WHERE registration_id = ?').run(id);
            const result = db.prepare('DELETE FROM registrations WHERE id = ?').run(id);
            return result.changes > 0;
        }
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

    // Filters

    getFilterOptions(): FilterOptions {
        const event_types = db.prepare(`
          SELECT DISTINCT event_type 
          FROM events 
          ORDER BY event_type
        `).all().map(row => row.event_type);

        const years = db.prepare(`
          SELECT DISTINCT strftime('%Y', date) as year 
          FROM events 
          ORDER BY year
        `).all().map(row => parseInt(row.year));

        const months = db.prepare(`
          SELECT DISTINCT strftime('%m', date) as month 
          FROM events 
          ORDER BY month
        `).all().map(row => parseInt(row.month));

        return {
            event_types,
            years,
            months
        };
    }

}