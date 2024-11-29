// types.ts

export interface User {
    id: number;
    name: string;
    email: string;
    admin: boolean;
}

export interface Comment {
    id: string;
    user: {
        name: string;
        id: number;
    };
    comment: string;
    lesson: {
        slug: string;
    };
}

export interface ContentBlock {
    id: string;
    content: string;
}

export interface LessonType {
    id: string;
    title: string;
    slug: string;
    preamble: string;
    content_blocks?: ContentBlock[];
    comments: Comment[];
    order?: string;
    text?: Array<{
        id: string;
        text: string;
    }>;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    lessons: LessonType[];
}

export interface CourseFields {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
}

export interface SignUpFields {
    name: string;
    email: string;
    admin: boolean;
}

// API response types
export type GetCoursesResponse = Course[];
export type GetCategoriesResponse = string[];
export type GetUsersResponse = string[];

// Props interfaces
export interface CourseProps {
    courseSlug: string;
    lessonSlug?: string;
}

export interface LessonProps {
    courseSlug: string;
    lessonSlug: string;
}