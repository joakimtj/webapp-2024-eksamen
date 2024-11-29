import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Course, LessonType, Comment, LessonProps } from "../types";

const getLesson = async (courseSlug: string, lessonSlug: string): Promise<LessonType> => {
    try {
        const response = await fetch(
            `http://localhost:3999/api/courses/${courseSlug}/lessons/${lessonSlug}`
        );
        if (!response.ok) {
            throw new Error('Failed to fetch lesson');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lesson:', error);
        throw error;
    }
};

const getCourse = async (slug: string): Promise<Course> => {
    try {
        const response = await fetch(`http://localhost:3999/api/courses/${slug}`);
        if (!response.ok) {
            throw new Error('Failed to fetch course');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
    }
};

interface CommentFormData {
    id: string;
    createdBy: {
        id: number;
        name: string;
    };
    comment: string;
    lesson: {
        slug: string;
    };
}

const createComment = async (data: CommentFormData): Promise<void> => {
    // TODO: Implement actual API call
    // For now, just simulating comment creation
    console.log("Creating comment:", data);
};

function Lesson({ courseSlug, lessonSlug }: LessonProps) {
    const [success, setSuccess] = useState<boolean>(false);
    const [formError, setFormError] = useState<boolean>(false);
    const [lessonComments, setComments] = useState<Comment[]>([]);
    const [comment, setComment] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [lesson, setLesson] = useState<LessonType | null>(null);
    const [course, setCourse] = useState<Course | null>(null);

    const handleComment = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setComment(event.target.value);
    };

    const handleName = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(false);
        setSuccess(false);

        if (!comment || !name) {
            setFormError(true);
            return;
        }

        try {
            const commentData: CommentFormData = {
                id: `${Math.floor(Math.random() * 1000 + 1)}`,
                createdBy: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name,
                },
                comment,
                lesson: { slug: lessonSlug },
            };

            await createComment(commentData);

            // TODO: Implement getComments function and update comments
            // const commentsData = await getComments(lessonSlug);
            // setComments(commentsData);

            setSuccess(true);
            setComment("");
            setName("");
        } catch (error) {
            console.error('Error creating comment:', error);
            setFormError(true);
        }
    };

    useEffect(() => {
        const getContent = async () => {
            try {
                const [lessonData, courseData] = await Promise.all([
                    getLesson(courseSlug, lessonSlug),
                    getCourse(courseSlug)
                ]);

                setLesson(lessonData);
                setCourse(courseData);

                // Set comments from lesson data
                if (lessonData.comments?.[0]?.id == null) {
                    setComments([]);
                } else {
                    setComments(lessonData.comments);
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                // Here you might want to add error handling UI feedback
            }
        };

        getContent();
    }, [courseSlug, lessonSlug]);

    return (
        <div>
            <div className="flex justify-between">
                <h3 data-testid="course_title" className="mb-6 text-base font-bold">
                    <a className="underline" href={`/courses/${course?.slug}`}>
                        {course?.title}
                    </a>
                </h3>
                <span data-testid="course_category">
                    Kategori: <span className="font-bold">{course?.category}</span>
                </span>
            </div>
            <h2 className="text-2xl font-bold" data-testid="lesson_title">
                {lesson?.title}
            </h2>
            <p
                data-testid="lesson_preAmble"
                className="mt-4 font-semibold leading-relaxed"
            >
                {lesson?.preamble}
            </p>
            {lesson?.content_blocks && lesson.content_blocks.length > 1 &&
                lesson.content_blocks.map((text) => (
                    <p
                        data-testid="lesson_text"
                        className="mt-4 font-normal"
                        key={text.id}
                    >
                        {text.content}
                    </p>
                ))}
            <section data-testid="comments">
                <h4 className="mt-8 mb-4 text-lg font-bold">
                    Kommentarer ({lessonComments?.length})
                </h4>
                <form data-testid="comment_form" onSubmit={handleSubmit} noValidate>
                    <label className="mb-4 flex flex-col" htmlFor="name">
                        <span className="mb-1 text-sm font-semibold">Navn*</span>
                        <input
                            data-testid="form_name"
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={handleName}
                            className="w-full rounded bg-slate-100"
                        />
                    </label>
                    <label className="mb-4 flex flex-col" htmlFor="comment">
                        <span className="mb-1 text-sm font-semibold">
                            Legg til kommentar*
                        </span>
                        <textarea
                            data-testid="form_textarea"
                            name="comment"
                            id="comment"
                            value={comment}
                            onChange={handleComment}
                            className="w-full rounded bg-slate-100"
                            cols={30}
                        />
                    </label>
                    <button
                        className="rounded bg-emerald-600 px-10 py-2 text-center text-base text-white"
                        data-testid="form_submit"
                        type="submit"
                    >
                        Legg til kommentar
                    </button>
                    {formError && (
                        <p className="font-semibold text-red-500" data-testid="form_error">
                            Fyll ut alle felter med *
                        </p>
                    )}
                    {success && (
                        <p
                            className="font-semibold text-emerald-500"
                            data-testid="form_success"
                        >
                            Skjema sendt
                        </p>
                    )}
                </form>
                <ul className="mt-8" data-testid="comments_list">
                    {lessonComments?.length > 0 &&
                        lessonComments.map((c) => (
                            <li
                                className="mb-6 rounded border border-slate-200 px-4 py-6"
                                key={c.id}
                            >
                                <h5 data-testid="user_comment_name" className="font-bold">
                                    {c.user.name}
                                </h5>
                                <p data-testid="user_comment">{c.comment}</p>
                            </li>
                        ))}
                </ul>
            </section>
        </div>
    );
}

export default Lesson;