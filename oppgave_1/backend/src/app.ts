import { Hono } from "hono";
import { cors } from "hono/cors";


import { HTTPException } from 'hono/http-exception';
import { DatabaseService } from './services/database';
import { Success, Failure, Result, CreateCourseRequest, CreateLessonRequest, CreateCommentRequest, DatabaseError, LessonResponse, DbLesson } from './types';

const db = new DatabaseService('db/db.db');

const app = new Hono();

app.use("/*", cors());

// Courses endpoints
app.get('/api/courses', (c) => {
	try {
		const courses = db.getCourses();
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

app.get('/api/courses/:id/lessons/:lesson', (c) => {
	try {
		interface ExtendedLesson extends DbLesson {
			content_blocks: string;
			comments: string;
		}

		const id = c.req.param('id');
		const lesson = c.req.param('lesson');
		if (!id || !lesson) {
			throw new HTTPException(400, { message: 'Invalid course or lesson ID' });
		}
		const result = db.getLessonBySlug(id, lesson) as ExtendedLesson;
		// TODO fix original type instead
		const rresult = {
			...result,
			content_blocks: JSON.parse(result.content_blocks),
			comments: JSON.parse(result.comments)
		}
		return c.json(rresult);
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

`
{
  "id": "465",
  "title": "asfasf",
  "slug": "asfasf",
  "description": "asf",
  "category": "Marketing",
  "lessons": [
    {
      "id": "292",
      "title": "a",
      "slug": "f",
      "preamble": "a",
      "text": [
        {
          "id": "790",
          "text": "a"
        }
      ],
      "comments": [],
      "order": "0"
    }
  ]
}
`

app.post('/api/courses', async (c) => {
	try {
		// 1. Create course
		// 2. Create lessons
		// 3. Create lesson_content_blocks
		const data = await c.req.json<CreateCourseRequest>();
		console.log(data);
		const courseId = db.createCourse(data);
		const lessons = data.lessons;
		lessons.forEach((lesson) => {
			// get index of lesson
			type content_block = {
				content: string;
				block_order: number;
			}

			const content_blocks: content_block[] = lesson.text.map((text, index) => {
				return { content: text, block_order: index };
			});
			// create lesson
			let request: CreateLessonRequest = {
				courseId: courseId,
				title: lesson.title,
				preamble: lesson.preamble,
				slug: lesson.slug,
				lesson_order: lessons.indexOf(lesson),
				content_blocks: content_blocks
			};
			const lessonId = db.createLesson(request);
			console.log("New lesson id: ", lessonId);
		});
		return c.json({ message: 'Course created successfully' }, 201);
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
app.post('/api/courses/:courseId/lessons', async (c) => {
	try {
		const courseId = c.req.param('courseId');
		const data = await c.req.json<Omit<CreateLessonRequest, 'courseId'>>();
		const lesson = db.createLesson({ ...data, courseId });
		return c.json(lesson, 201);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
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
		return c.json(users, 200);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(500, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});

/*
app.post('/api/users', async (c) => {
	try {
		const data = await c.req.json();
		const user = db.createUser(data);
		return c.json(user, 201);
	} catch (err) {
		if (err instanceof DatabaseError) {
			throw new HTTPException(400, { message: err.message });
		}
		throw new Error("An error occurred");
	}
});
*/

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
