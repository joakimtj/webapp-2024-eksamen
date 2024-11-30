import { Hono } from 'hono';
import { AppDB } from '../services/database';
import { Result } from '../types';
import type { Template } from '../types/models';

export const templates = new Hono();
const db = new AppDB();

templates.get('/', (c) => {
    try {
        const templates = db.getAllTemplates();
        return c.json<Result<Template[]>>({ success: true, data: templates });
    } catch (err) {
        return c.json<Result<Template[]>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

templates.get('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const template = db.getTemplateById(id);
        if (!template) {
            return c.json<Result<Template>>({
                success: false,
                error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' }
            }, { status: 404 });
        }
        return c.json<Result<Template>>({ success: true, data: template });
    } catch (err) {
        return c.json<Result<Template>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

templates.put('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();
        const template = db.updateTemplate(id, data);
        if (!template) {
            return c.json<Result<Template>>({
                success: false,
                error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' }
            }, { status: 404 });
        }
        return c.json<Result<Template>>({ success: true, data: template });
    } catch (err) {
        return c.json<Result<Template>>({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }
        }, { status: 500 });
    }
});

templates.post('/', async (c) => {
    try {
        const body = await c.req.json();

        // Validate required fields
        if (!body.name || !body.event_type || !body.default_capacity || body.default_price === undefined) {
            return c.json<Result<Template>>({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Missing required fields'
                }
            }, { status: 400 });
        }

        const template = db.createTemplate({
            name: body.name,
            event_type: body.event_type,
            default_capacity: body.default_capacity,
            default_price: body.default_price,
            rules: body.rules || '{}'
        });

        return c.json<Result<Template>>({
            success: true,
            data: template
        });
    } catch (err) {
        return c.json<Result<Template>>({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Unknown error'
            }
        }, { status: 500 });
    }
});

templates.delete('/:id', (c) => {
    try {
        const id = c.req.param('id');
        const success = db.deleteTemplate(id);
        if (!success) {
            return c.json<Result<void>>({
                success: false,
                error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' }
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
