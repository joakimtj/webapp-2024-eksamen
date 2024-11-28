import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { events } from './routes/events';
import { templates } from './routes/templates';
import { registrations } from './routes/registrations';
import { attendees } from './routes/attendees';

const app = new Hono();

app.use('/*', cors());
app.route('/api/events', events);
app.route('/api/templates', templates);
app.route('/api/registrations', registrations);
app.route('/api/attendees', attendees);

app.onError((err, c) => {
    console.error(err);
    return c.json(
        { error: { message: err.message } },
        { status: 500 }
    );
});

export default app;
