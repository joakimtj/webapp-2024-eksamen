
import Database from 'better-sqlite3';
import {
    DbCourse,
    DbLesson,
    DbComment,
    DatabaseError,
    NotFoundError,
    CourseWithLessonsResponse,
    CreateCourseRequest,
    CreateLessonRequest,
    CreateCommentRequest
} from '../types';

//import { generateId, generateSlug } from './utils';

const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');
const generateId = () => crypto.randomUUID();


export class DatabaseService {
    private db: Database.Database;
    private statements!: {
        getCourses: Database.Statement<[], DbCourse>;
        getCourseWithLessons: Database.Statement<[string], { course_data: string }>;
        createCourse: Database.Statement<[string, string, string, string, string], void>;
        updateCourseCategory: Database.Statement<[string, string], void>;
        deleteCourse: Database.Statement<[string], void>;
        getLessonsForCourse: Database.Statement<[string], DbLesson>;
        createLesson: Database.Statement<[string, string, string, string, string, number], void>;
        getLessonById: Database.Statement<[string], DbLesson>;

        getLessonBySlug: Database.Statement<[string, string], DbLesson>;

        createLessonContentBlock: Database.Statement<[string, string, string, number, string], void>;
        createComment: Database.Statement<[string, string, string, string], void>;
        getCommentByLessonId: Database.Statement<[string], DbComment>;
        getCommentById: Database.Statement<[string], DbComment>;
        getCategories: Database.Statement<[], { name: string }>;
        getUsers: Database.Statement<[], { name: string }>;
        createUser: Database.Statement<[string, string, string], void>;
    };

    constructor(dbPath: string) {
        this.db = new Database(dbPath, { verbose: console.log });
        // this.db = new Database(dbPath);

        this.db.pragma('journal_mode = WAL');
        this.initializeStatements();
    }

    private initializeStatements() {
        // Prepare all statements once during initialization
        this.statements = {
            getCourses: this.db.prepare(`
                SELECT c.*, 
                       json_group_array(DISTINCT cat.name) as categories
                FROM courses c
                LEFT JOIN categories cat ON c.category = cat.name
                GROUP BY c.id
            `),

            getCourseWithLessons: this.db.prepare(`
                WITH lesson_content AS (
                    SELECT l.id as lesson_id,
                        json_group_array(
                            json_object(
                                'id', lcb.id,
                                'content', lcb.content,
                                'block_order', lcb.block_order
                            )
                        ) as content_blocks
                    FROM lessons l
                    LEFT JOIN lesson_content_blocks lcb ON l.id = lcb.lesson_id
                    GROUP BY l.id
                )
                SELECT json_object(
                    'id', c.id,
                    'title', c.title,
                    'slug', c.slug,
                    'description', c.description,
                    'category', c.category,
                    'created_at', c.created_at,
                    'lessons', (
                        SELECT json_group_array(
                            json_object(
                                'id', l.id,
                                'title', l.title,
                                'slug', l.slug,
                                'preamble', l.preamble,
                                'content_blocks', COALESCE(
                                    NULLIF(lc.content_blocks, '[null]'),
                                    '[]'
                                )
                            )
                        )
                        FROM lessons l
                        LEFT JOIN lesson_content AS lc ON l.id = lc.lesson_id
                        WHERE l.course_id = c.id
                        ORDER BY l.lesson_order
                    )
                ) as course_data
                FROM courses c
                WHERE c.slug = ?
            `),
            createCourse: this.db.prepare(`
                INSERT INTO courses (id, title, slug, description, category) 
                VALUES (?, ?, ?, ?, ?)
            `),

            updateCourseCategory: this.db.prepare(`
                UPDATE courses SET category = ? WHERE id = ?
            `),

            deleteCourse: this.db.prepare(`
                DELETE FROM courses WHERE id = ?
            `),

            getLessonBySlug: this.db.prepare(`
                WITH lesson_comments AS (
                SELECT l.id as lesson_id,
                    json_group_array(
                        json_object(
                            'id', c.id,
                            'comment', c.comment,
                            'user', json_object(
                                'id', u.id,
                                'name', u.name
                            ),
                            'created_at', c.created_at
                        )
                    ) as comments
                FROM lessons l
                LEFT JOIN comments c ON l.id = c.lesson_id
                LEFT JOIN users u ON c.user_id = u.id
                GROUP BY l.id
            ),
            lesson_content AS (
                SELECT l.id as lesson_id,
                    json_group_array(
                        json_object(
                            'id', lcb.id,
                            'content', lcb.content,
                            'block_order', lcb.block_order
                        )
                    ) as content_blocks
                FROM lessons l
                LEFT JOIN lesson_content_blocks lcb ON l.id = lcb.lesson_id
                GROUP BY l.id
            )
            SELECT 
                l.id,
                l.title,
                l.slug,
                l.preamble,
                COALESCE(NULLIF(lc.content_blocks, '[null]'), '[]') as content_blocks,
                COALESCE(NULLIF(lcm.comments, '[null]'), '[]') as comments
            FROM lessons l
            JOIN courses c ON l.course_id = c.id
            LEFT JOIN lesson_content AS lc ON l.id = lc.lesson_id
            LEFT JOIN lesson_comments lcm ON l.id = lcm.lesson_id
            WHERE c.slug = ? AND l.slug = ?
            `),
            getLessonsForCourse: this.db.prepare(`
                SELECT * FROM lessons WHERE course_id = ?
            `),

            createLesson: this.db.prepare(`
                INSERT INTO lessons (id, course_id, title, slug, preamble, lesson_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `),

            createLessonContentBlock: this.db.prepare(`
                INSERT INTO lesson_content_blocks (id, lesson_id, content, block_order)
                SELECT ?, ?, ?, ?
                WHERE EXISTS (SELECT 1 FROM lessons WHERE id = ?)
            `),

            getLessonById: this.db.prepare(`
                SELECT * FROM lessons WHERE id = ?
            `),

            getCommentByLessonId: this.db.prepare(`
                SELECT 
                c.id,
                c.comment,
                json_object(
                    'id', u.id,
                    'name', u.name
                ) as user,
                c.created_at
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.lesson_id = ?
                ORDER BY c.created_at DESC;
            `),

            createComment: this.db.prepare(`
                INSERT INTO comments (id, lesson_id, user_id, comment) 
                VALUES (?, ?, ?, ?)
            `),

            getCommentById: this.db.prepare(`
                SELECT * FROM comments WHERE id = ?
            `),

            getCategories: this.db.prepare(`
                SELECT name FROM categories
            `),

            getUsers: this.db.prepare(`
                SELECT name FROM users
            `),

            createUser: this.db.prepare(`
                INSERT INTO users (id, name, email) VALUES (?, ?, ?)
            `)
        };
    }

    // Courses
    getCourses(): DbCourse[] {
        try {
            return this.statements.getCourses.all();
        } catch (err) {
            throw new DatabaseError('Failed to get courses', 'DB_ERROR', err as Error);
        }
    }

    getCourseWithLessons(id: string): CourseWithLessonsResponse {
        try {
            const row = this.statements.getCourseWithLessons.get(id);
            if (!row) {
                throw new NotFoundError(`Course with id ${id} not found`);
            }
            return JSON.parse(row.course_data);
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            throw new DatabaseError('Failed to get course', 'DB_ERROR', err as Error);
        }
    }
    createCourse(data: CreateCourseRequest): string {
        const id = generateId();
        //const slug = generateSlug(data.title);
        const slug = data.slug;
        try {
            this.statements.createCourse.run(id, data.title, slug, data.description, data.category);
            return id;
        } catch (err) {
            // Unique constraint likely failed?
            throw new DatabaseError('Failed to create course', 'DB_ERROR', err as Error);
        }
    }

    updateCourseCategory(id: string, category: string): DbCourse {
        try {
            this.statements.updateCourseCategory.run(category, id);
            return this.getCourseWithLessons(id);
        } catch (err) {
            throw new DatabaseError('Failed to update course', 'DB_ERROR', err as Error);
        }
    }

    deleteCourse(id: string): void {
        try {
            this.statements.deleteCourse.run(id);
        } catch (err) {
            throw new DatabaseError('Failed to delete course', 'DB_ERROR', err as Error);
        }
    }

    // Lessons
    getLessonsForCourse(courseId: string): DbLesson[] {
        try {

            return this.statements.getLessonsForCourse.all(courseId);
        } catch (err) {
            throw new DatabaseError('Failed to get lessons', 'DB_ERROR', err as Error);
        }
    }

    getLessonBySlug(courseSlug: string, lessonSlug: string): DbLesson {
        try {
            const lesson = this.statements.getLessonBySlug.get(courseSlug, lessonSlug);
            if (!lesson) {
                throw new NotFoundError(`Lesson with slug ${lessonSlug} not found`);
            }
            return lesson;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            throw new DatabaseError('Failed to get lesson', 'DB_ERROR', err as Error);
        }
    }

    createLesson(data: CreateLessonRequest): string {
        const id = generateId();

        try {
            this.statements.createLesson.run(
                id,
                data.courseId,
                data.title,
                data.slug,
                data.preamble,
                data.lesson_order
            );
        } catch (err) {
            throw new DatabaseError('Failed to create lesson', 'DB_ERROR', err as Error);
        }
        try {
            console.log("CONTENT BLOCKS:");
            data.content_blocks.forEach((block, index) => {
                console.log(block);
                this.statements.createLessonContentBlock.run(
                    generateId(),
                    id,
                    block.content,
                    block.block_order,
                    id
                );
            });
        } catch (err) {
            throw new DatabaseError('Failed to create lesson content blocks', 'DB_ERROR', err as Error);
        }
        return id;
    }

    private getLessonById(id: string): DbLesson {
        const lesson = this.statements.getLessonById.get(id);
        if (!lesson) {
            throw new NotFoundError(`Lesson with id ${id} not found`);
        }
        return lesson;
    }

    // Comments
    createComment(data: CreateCommentRequest): DbComment {
        const id = generateId();

        try {
            this.statements.createComment.run(id, data.lessonId, data.createdBy, data.comment);
            return this.getCommentById(id);
        } catch (err) {
            throw new DatabaseError('Failed to create comment', 'DB_ERROR', err as Error);
        }
    }

    getCommentsByLessonId(lessonId: string): DbComment[] {
        try {
            return this.statements.getCommentByLessonId.all(lessonId);
        } catch (err) {
            throw new DatabaseError('Failed to get comments', 'DB_ERROR', err as Error);
        }
    }

    private getCommentById(id: string): DbComment {
        const comment = this.statements.getCommentById.get(id);
        if (!comment) {
            throw new NotFoundError(`Comment with id ${id} not found`);
        }
        return comment;
    }

    // Categories
    getCategories(): string[] {
        try {
            return this.statements.getCategories.all().map((row) => row.name);
        } catch (err) {
            throw new DatabaseError('Failed to get categories', 'DB_ERROR', err as Error);
        }
    }

    // Users
    getUsers(): string[] {
        try {
            return this.statements.getUsers.all().map((row) => row.name);
        } catch (err) {
            throw new DatabaseError('Failed to get users', 'DB_ERROR', err as Error);
        }
    }

    createUser(name: string, email: string): void {
        try {
            const id = generateId();
            this.statements.createUser.run(id, name, email);
        } catch (err) {
            throw new DatabaseError('Failed to create user', 'DB_ERROR', err as Error);
        }
    }
}