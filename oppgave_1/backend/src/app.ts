import { Hono } from "hono";
import { cors } from "hono/cors";


import { HTTPException } from 'hono/http-exception';
import { DatabaseService } from './services/database';
import { Success, Failure, Result, CreateCourseRequest, CreateLessonRequest, CreateCommentRequest, DatabaseError } from './types';

const db = new DatabaseService('db/db.db');

const app = new Hono();

app.use("/*", cors());

// Courses endpoints
app.get('/api/courses', (c) => {
	try {
		const withLessons = c.req.query('include_lessons') === 'true';
		const courses = withLessons ? db.getCoursesWithLessons() : db.getCourses();
		return c.json(courses);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

app.get('/api/courses/:id', (c) => {
	try {
		const id = c.req.param('id');
		const course = db.getCourseWithLessons(id);
		return c.json(course);
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message.includes('not found')) {
				throw new HTTPException(404, { message: err.message });
			}
			throw new HTTPException(500, { message: err.message });
		}
		console.log(err);
		throw new Error("An error occurred");
	}
});

app.post('/api/courses', async (c) => {
	try {
		const data = await c.req.json<CreateCourseRequest>();
		const course = db.createCourse(data);
		return c.json(course, 201);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(400, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

app.patch('/api/courses/:id/category', async (c) => {
	try {
		const id = c.req.param('id');
		const { category } = await c.req.json<{ category: string }>();
		const course = db.updateCourseCategory(id, category);
		return c.json(course);
	} catch (err) {
		if (err instanceof DatabaseError) {
			if (err.message.includes('not found')) {
				throw new HTTPException(404, { message: err.message });
			}
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

app.delete('/api/courses/:id', (c) => {
	try {
		const id = c.req.param('id');
		db.deleteCourse(id);
		return c.json({ message: 'Course deleted successfully' }, 200);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

// Lessons endpoints
app.get('/api/courses/:courseId/lessons', (c) => {
	try {
		const courseId = c.req.param('courseId');
		const lessons = db.getLessonsForCourse(courseId);
		return c.json(lessons);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

app.post('/api/courses/:courseId/lessons', async (c) => {
	try {
		const courseId = c.req.param('courseId');
		const data = await c.req.json<Omit<CreateLessonRequest, 'courseId'>>();
		const lesson = db.createLesson({ ...data, courseId });
		return c.json(lesson, 201);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(400, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

// Comments endpoints
app.post('/api/lessons/:lessonId/comments', async (c) => {
	try {
		const lessonId = c.req.param('lessonId');
		const data = await c.req.json<Omit<CreateCommentRequest, 'lessonId'>>();
		const comment = db.createComment({ ...data, lessonId });
		return c.json(comment, 201);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(400, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

// Categories endpoint
app.get('/api/categories', (c) => {
	try {
		const categories = db.getCategories();
		return c.json(categories);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

// Users endpoint
app.get('/api/users', (c) => {
	try {
		const users = db.getUsers();
		return c.json(users);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

// Health check endpoint
app.get('/health', (c) => {
	return c.json({ status: 'ok' });
});

app.onError((err, c) => {
	console.error(err);

	return c.json(
		{
			error: {
				message: err.message,
			},
		},
		{ status: 500 }
	);
});

export default app;
