export type Success<T> = {
  success: true;
  data: T;
};

export type Failure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type Result<T> = Success<T> | Failure;




// Database Types
export interface DbCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  created_at: string;
}

export interface DbLesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  preamble: string;
  lesson_order: number;
  created_at: string;
}

export interface DbLessonContentBlock {
  id: string;
  lesson_id: string;
  content: string;
  block_order: number;
  created_at: string;
}

export interface DbComment {
  id: string;
  lesson_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface DbCategory {
  name: string;
  created_at: string;
}

// API Response Types
export interface CourseResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  created_at: string;
}

export interface CourseWithLessonsResponse extends CourseResponse {
  lessons: LessonResponse[];
}

export interface LessonResponse {
  id: string;
  title: string;
  slug: string;
  preamble: string;
  content_blocks: ContentBlockResponse[];
  comments: CommentResponse[];
}

export interface ContentBlockResponse {
  id: string;
  content: string;
  block_order: number;
}

export interface CommentResponse {
  id: string;
  comment: string;
  user: {
    id: string;
    name: string;
  };
  created_at: string;
}

// API Request Types

interface LessonRequest {
  title: string;
  slug: string;
  preamble: string;
  text: string[];
  order: number;
}

export interface CreateCourseRequest {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  lessons: LessonRequest[];
}


export interface UpdateCourseRequest {
  category: string;
}

export interface CreateLessonRequest {
  courseId: string;
  title: string;
  preamble: string;
  slug: string;
  lesson_order: number;
  content_blocks: {
    content: string;
    block_order: number;
  }[];
}

export interface CreateCommentRequest {
  lessonId: string;
  comment: string;
  createdBy: string;
}

// Utility Types
export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: {
    message: string;
    code?: string;
  };
}

// Query Parameters Types
export interface LessonQueryParams {
  courseId?: string;
}

export interface CommentQueryParams {
  lessonId?: string;
}

// Database Error Types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}