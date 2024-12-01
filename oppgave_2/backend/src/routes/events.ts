import { Hono } from 'hono';
import { AppDB } from '../services/database';
import { Result } from '../types';
import { Event, EventFilters, FilterOptions } from '../types/models';

export const events = new Hono();
const db = new AppDB();

// Order matters for the /filters route. If it doesn't come first, it will be treated as a slug

events.get('/filters', (c) => {
    try {
        const filterOptions = db.getFilterOptions();

        return c.json<Result<FilterOptions>>({
            success: true,
            data: filterOptions
        });
    } catch (err) {
        return c.json<Result<FilterOptions>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});


events.get('/capacity/:eventId', async (c) => {
    try {
        const eventId = c.req.param('eventId');

        // Get all registrations with 'approved' status for this event
        const registrations = db.getRegistrationsByEventId(eventId)
            .filter(reg => reg.status === 'approved');

        // Get and count all attendees from approved registrations
        const totalAttendees = registrations.reduce((total, registration) => {
            const attendees = db.getAttendeesByRegistrationId(registration.id);
            return total + attendees.length;
        }, 0);

        return c.json<Result<{ spotsLeft: number }>>({
            success: true,
            data: { spotsLeft: totalAttendees }
        });
    } catch (err) {
        return c.json<Result<null>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});

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

events.post('/', async (c) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.title || !body.event_type || !body.date || !body.location || !body.capacity) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Missing required fields'
                }
            }, { status: 400 });
        }

        // Generate slug if not provided
        if (!body.slug) {
            body.slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Check if slug already exists
        const existingEvent = db.getEventBySlug(body.slug);
        if (existingEvent) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'DUPLICATE_SLUG',
                    message: 'An event with this slug already exists'
                }
            }, { status: 400 });
        }

        try {
            const event = db.createEvent(body);
            return c.json<Result<Event>>({
                success: true,
                data: event
            });
        } catch (error) {
            return c.json<Result<Event>>({
                success: false,
                error: {
                    code: 'RULE_VIOLATION',
                    message: error instanceof Error ? error.message : 'Unknown error'
                }
            }, { status: 400 });
        }

    } catch (err) {
        return c.json<Result<Event>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
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
