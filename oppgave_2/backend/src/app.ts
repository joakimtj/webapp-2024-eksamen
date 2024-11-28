import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { events } from './routes/events';

const app = new Hono();

app.use('/*', cors());
app.route('/api/events', events);

app.onError((err, c) => {
    console.error(err);
    return c.json(
        { error: { message: err.message } },
        { status: 500 }
    );
});

export default app;
