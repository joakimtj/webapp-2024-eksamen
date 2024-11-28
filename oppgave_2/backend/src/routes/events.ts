import { Hono } from 'hono';
import { AppDB } from '../services/database';
import { Result } from '../types';
import { Event, EventFilters } from '../types/models';

export const events = new Hono();
const db = new AppDB();

events.get('/', (c) => {
    try {
        const { month, year, event_type } = c.req.query();

        const filters: EventFilters = {};

        if (month) filters.month = parseInt(month);
        if (year) filters.year = parseInt(year);
        if (event_type) filters.event_type = event_type;

        const events = db.getAllEvents(Object.keys(filters).length > 0 ? filters : undefined);

        return c.json<Result<Event[]>>({
            success: true,
            data: events
        });
    } catch (err) {
        return c.json<Result<Event[]>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});

events.get('/:slug', async (c): Promise<Response> => {
    try {
        const slug = c.req.param('slug');
        const event = db.getEventBySlug(slug);
        console.log(event);
        if (!event) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            }, { status: 404 });
        }

        return c.json<Result<Event>>({
            success: true,
            data: event
        });
    } catch (err) {
        return c.json<Result<Event>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error occurred'
            }
        }, { status: 500 });
    }
});

events.put('/:id', async (c): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const event = db.replaceEvent(id, body);

        if (!event) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            }, { status: 404 });
        }

        return c.json<Result<Event>>({
            success: true,
            data: event
        });
    } catch (err) {
        return c.json<Result<Event>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error occurred'
            }
        }, { status: 500 });
    }
});

events.patch('/:id', async (c): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        const event = db.updateEvent(id, body);

        if (!event) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            }, { status: 404 });
        }

        return c.json<Result<Event>>({
            success: true,
            data: event
        });
    } catch (err) {
        return c.json<Result<Event>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error occurred'
            }
        }, { status: 500 });
    }
});

events.delete('/:id', async (c): Promise<Response> => {
    try {
        const id = c.req.param('id');
        const success = db.deleteEvent(id);

        if (!success) {
            return c.json<Result<void>>({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            }, { status: 404 });
        }

        return c.json<Result<void>>({
            success: true,
            data: undefined
        });
    } catch (err) {
        return c.json<Result<void>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error occurred'
            }
        }, { status: 500 });
    }
});