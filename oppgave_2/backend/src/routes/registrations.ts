import { Hono } from 'hono';
import { AppDB } from '../services/database';
import { Result } from '../types';
import type { Registration } from '../types/models';


export const registrations = new Hono();
const db = new AppDB();

registrations.get('/', (c) => {
    try {
        const registrations = db.getAllRegistrations();
        return c.json<Result<Registration[]>>({ success: true, data: registrations });
    } catch (err) {
        return c.json<Result<Registration[]>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

registrations.get('/event/:eventId', (c) => {
    try {
        const eventId = c.req.param('eventId');
        const registrations = db.getRegistrationsByEventId(eventId);
        return c.json<Result<Registration[]>>({ success: true, data: registrations });
    } catch (err) {
        return c.json<Result<Registration[]>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

registrations.get('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const registration = db.getRegistrationById(id);
        if (!registration) {
            return c.json<Result<Registration>>({
                success: false,
                error: { code: 'REGISTRATION_NOT_FOUND', message: 'Registration not found' }
            }, { status: 404 });
        }
        return c.json<Result<Registration>>({ success: true, data: registration });
    } catch (err) {
        return c.json<Result<Registration>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

registrations.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();
        const registration = db.updateRegistration(id, data);
        if (!registration) {
            return c.json<Result<Registration>>({
                success: false,
                error: { code: 'REGISTRATION_NOT_FOUND', message: 'Registration not found' }
            }, { status: 404 });
        }
        return c.json<Result<Registration>>({ success: true, data: registration });
    } catch (err) {
        return c.json<Result<Registration>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

registrations.post('/', async (c) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.event_id || !body.status || body.total_price === undefined) {
            return c.json<Result<Registration>>({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Missing required fields'
                }
            }, { status: 400 });
        }

        // Verify event exists
        const event = db.getEventById(body.event_id);
        if (!event) {
            return c.json<Result<Registration>>({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            }, { status: 404 });
        }

        const registration = db.createRegistration({
            event_id: body.event_id,
            status: body.status,
            total_price: body.total_price
        });

        return c.json<Result<Registration>>({
            success: true,
            data: registration
        });
    } catch (err) {
        return c.json<Result<Registration>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});

registrations.delete('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const success = db.deleteRegistration(id);
        if (!success) {
            return c.json<Result<void>>({
                success: false,
                error: { code: 'REGISTRATION_NOT_FOUND', message: 'Registration not found' }
            }, { status: 404 });
        }
        return c.json<Result<void>>({ success: true, data: undefined });
    } catch (err) {
        return c.json<Result<void>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});
