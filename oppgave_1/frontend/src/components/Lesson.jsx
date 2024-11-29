
import { useState, useEffect } from "react";

const getLesson = async (courseSlug, lessonSlug) => {
    const lesson =
        await fetch(`http://localhost:3999/api/courses/${courseSlug}/lessons/${lessonSlug}`)
            .then((response) => response.json())
            .then((data) => {
                return data;
            });
    return lesson;
};


const getCourse = async (slug) => {
    const course =
        await fetch(`http://localhost:3999/api/courses/${slug}`)
            .then((response) => response.json())
            .then((data) => {
                return data;
            });
    return course;
};

/*
const getComments = async (lessonSlug) => {
    const lessons =
        await fetch(`http://localhost:3999/api/lessons/${lessonSlug}/comments`)
            .then((response) => response.json())
            .then((data) => {
                return data;
            });
    return lessons;
};*/

const createComment = async (data) => {
    await comments.push(data);
};


function Lesson(slug) {
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState(false);
    const [lessonComments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [name, setName] = useState("");
    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);

    const lessonSlug = slug.lessonSlug;
    const courseSlug = slug.courseSlug;

    const handleComment = (event) => {
        setComment(event.target.value);
    };

    const handleName = (event) => {
        setName(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError(false);
        setSuccess(false);
        if (!comment || !name) {
            setFormError(true);
        } else {
            await createComment({
                id: `${Math.floor(Math.random() * 1000 + 1)}`,
                createdBy: {
                    id: Math.floor(Math.random() * 1000 + 1),
                    name,
                },
                comment,
                lesson: { slug: lessonSlug },
            });
            // TODO
            const commentsData = await getComments(lessonSlug);
            setComments(commentsData);
            setSuccess(true);
        }
    };

    useEffect(() => {
        const getContent = async () => {
            const lessonData = await getLesson(courseSlug, lessonSlug);
            const courseData = await getCourse(courseSlug);
            setLesson(lessonData);
            setCourse(courseData);
            setComments(lessonData.comments);
            // Extremely hacky way of handling empty comments because
            // the API returns an array with an empty comments object
            // and im too lazy to fix it
            if (lessonData.comments[0].id == null) {
                setComments([]);
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
            {lesson?.content_blocks?.length > 1 &&
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
                            type="text"
                            name="comment"
                            id="comment"
                            value={comment}
                            onChange={handleComment}
                            className="w-full rounded bg-slate-100"
                            cols="30"
                        />
                    </label>
                    <button
                        className="rounded bg-emerald-600 px-10 py-2 text-center text-base text-white"
                        data-testid="form_submit"
                        type="submit"
                    >
                        Legg til kommentar
                    </button>
                    {formError ? (
                        <p className="font-semibold text-red-500" data-testid="form_error">
                            Fyll ut alle felter med *
                        </p>
                    ) : null}
                    {success ? (
                        <p
                            className="font-semibold text-emerald-500"
                            data-testid="form_success"
                        >
                            Skjema sendt
                        </p>
                    ) : null}
                </form>
                <ul className="mt-8" data-testid="comments_list">
                    {lessonComments?.length > 0
                        ? lessonComments.map((c) => (
                            <li
                                className="mb-6 rounded border border-slate-200 px-4 py-6"
                                key={c.id}
                            >
                                <h5 data-testid="user_comment_name" className="font-bold">
                                    {c.user.name}
                                </h5>
                                <p data-testid="user_comment">{c.comment}</p>
                            </li>
                        ))
                        : null}
                </ul>
            </section>
        </div>
    );
}

export default Lesson;