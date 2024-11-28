import { Hono } from 'hono';
import { AppDB } from '../services/database';
import { Result } from '../types';
import type { Attendee } from '../types/models';

export const attendees = new Hono();
const db = new AppDB();

attendees.get('/', (c) => {
    try {
        const attendees = db.getAllAttendees();
        return c.json<Result<Attendee[]>>({ success: true, data: attendees });
    } catch (err) {
        return c.json<Result<Attendee[]>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

attendees.get('/registration/:registrationId', (c) => {
    try {
        const registrationId = c.req.param('registrationId');
        const attendees = db.getAttendeesByRegistrationId(registrationId);
        return c.json<Result<Attendee[]>>({ success: true, data: attendees });
    } catch (err) {
        return c.json<Result<Attendee[]>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

attendees.get('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const attendee = db.getAttendeeById(id);
        if (!attendee) {
            return c.json<Result<Attendee>>({
                success: false,
                error: { code: 'ATTENDEE_NOT_FOUND', message: 'Attendee not found' }
            }, { status: 404 });
        }
        return c.json<Result<Attendee>>({ success: true, data: attendee });
    } catch (err) {
        return c.json<Result<Attendee>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

attendees.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();
        const attendee = db.updateAttendee(id, data);
        if (!attendee) {
            return c.json<Result<Attendee>>({
                success: false,
                error: { code: 'ATTENDEE_NOT_FOUND', message: 'Attendee not found' }
            }, { status: 404 });
        }
        return c.json<Result<Attendee>>({ success: true, data: attendee });
    } catch (err) {
        return c.json<Result<Attendee>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

attendees.delete('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const success = db.deleteAttendee(id);
        if (!success) {
            return c.json<Result<void>>({
                success: false,
                error: { code: 'ATTENDEE_NOT_FOUND', message: 'Attendee not found' }
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

attendees.post('/', async (c) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.registration_id || !body.name || !body.email || !body.phone) {
            return c.json<Result<Attendee>>({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Missing required fields'
                }
            }, { status: 400 });
        }

        // Verify registration exists
        const registration = db.getRegistrationById(body.registration_id);
        if (!registration) {
            return c.json<Result<Attendee>>({
                success: false,
                error: {
                    code: 'REGISTRATION_NOT_FOUND',
                    message: 'Registration not found'
                }
            }, { status: 404 });
        }

        const attendee = db.createAttendee({
            registration_id: body.registration_id,
            name: body.name,
            email: body.email,
            phone: body.phone
        });

        return c.json<Result<Attendee>>({
            success: true,
            data: attendee
        });
    } catch (err) {
        return c.json<Result<Attendee>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});