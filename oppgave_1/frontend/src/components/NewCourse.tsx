"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CourseFields, LessonType, GetCategoriesResponse } from "../types";

interface CourseStep {
    id: string;
    name: string;
}

// Constants
const courseCreateSteps: CourseStep[] = [
    { id: '1', name: 'Kurs' },
    { id: '2', name: 'Leksjoner' },
];

function Create() {
    const [success, setSuccess] = useState<boolean>(false);
    const [formError, setFormError] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(0);
    const [currentLesson, setCurrentLesson] = useState<number>(0);
    const [categories, setCategories] = useState<string[]>([]);

    const [courseFields, setCourseFields] = useState<CourseFields>({
        id: `${Math.floor(Math.random() * 1000 + 1)}`,
        title: "",
        slug: "",
        description: "",
        category: "",
    });
    const [lessons, setLessons] = useState<LessonType[]>([]);

    const router = useRouter();

    const step = courseCreateSteps[current]?.name;

    const createCourse = async (data: CourseFields & { lessons: LessonType[] }): Promise<void> => {
        try {
            // strip 'id' from content_blocks
            const transformedLessons = data.lessons.map((lesson) => {
                const text = lesson.text?.map((field) => (field.text));
                return { ...lesson, text };
            });
            const tmp = { ...data, lessons: transformedLessons }
            console.log("Sending data:", tmp);
            const response = await fetch("http://localhost:3999/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tmp),
            });

            if (!response.ok) {
                throw new Error('Failed to create course');
            }

            const responseData = await response.json();
            console.log("Success:", responseData);
        } catch (error) {
            console.error("Error:", error);
            throw error;
        }
    };

    const isValid = (items: unknown): boolean => {
        // Handle empty array case for lessons
        if (Array.isArray(items) && items.length === 0) {
            return false;
        }

        // Helper function to validate a single lesson
        const isLessonValid = (lesson: LessonType): boolean => {
            return !!(
                lesson.title &&
                lesson.slug &&
                lesson.preamble &&
                lesson.text &&
                lesson.text.length > 0 &&
                lesson.text.every(t => t.text.trim() !== '')
            );
        };

        // For CourseFields validation
        const isCourseFieldsValid = (fields: CourseFields): boolean => {
            return !!(
                fields.title &&
                fields.slug &&
                fields.description &&
                fields.category
            );
        };

        // Handle array of lessons
        if (Array.isArray(items)) {
            return items.every(isLessonValid);
        }

        // Handle course fields
        if (items && typeof items === 'object') {
            return isCourseFieldsValid(items as CourseFields);
        }

        return false;
    };

    const handleSubmit = async (event: FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setFormError(false);
        setSuccess(false);

        if (lessons.length > 0 && isValid(lessons) && isValid(courseFields)) {
            setSuccess(true);
            setCurrent(2);
            // disable submit button after form submission
            event.currentTarget.disabled = true;

            const transformedLessons = lessons.map((lesson) => {
                const text = lesson.text?.map((field) => ({ id: field.id, text: field.text })) ?? [];
                return { ...lesson, text };
            });

            try {

                await createCourse({ ...courseFields, lessons: transformedLessons });


                console.log("Redirecting...");
                setTimeout(() => {
                    router.push("/courses");
                }, 5000);
            } catch (error) {
                setFormError(true);
                setSuccess(false);
            }
        } else {
            setFormError(true);
        }
    };

    const addTextBox = () => {
        const updatedLessonText = lessons.map((lesson, i) => {
            if (currentLesson === i) {
                const text = [
                    { id: `${Math.floor(Math.random() * 1000 + 1)}`, text: "" },
                ];
                if (!lesson.text || lesson.text.length === 0) {
                    text.push({
                        id: `${Math.floor(Math.random() * 1000 + 1)}`,
                        text: "",
                    });
                }
                return {
                    ...lesson,
                    text: [...(lesson.text ?? []), ...text],
                };
            }
            return lesson;
        });
        setLessons(updatedLessonText);
    };

    const removeTextBox = (index: number) => {
        const removed = lessons[currentLesson].text?.filter((_, i) => i !== index) ?? [];
        const updatedLessonText = lessons.map((lesson, i) => {
            if (currentLesson === i) {
                return {
                    ...lesson,
                    text: removed,
                };
            }
            return lesson;
        });
        setLessons(updatedLessonText);
    };

    const handleCourseFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setCourseFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleStep = (index: number) => {
        setFormError(false);
        switch (index) {
            case 0:
                return setCurrent(0);
            case 1:
                return isValid(courseFields) ? setCurrent(1) : setFormError(true);
            default:
                break;
        }
    };

    const handleLessonFieldChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number
    ) => {
        const { name, value } = event.target;
        let text = lessons[currentLesson]?.text ?? [];

        if (text.length === 0) {
            text = [{ id: `${Math.floor(Math.random() * 1000 + 1)}`, text: "" }];
        }

        if (text.length > 0) {
            text = text.map((_text, i) => {
                if (i === index) {
                    return { id: _text.id, text: value };
                }
                return _text;
            });
        }

        const updatedLessons = lessons.map((lesson, i) => {
            if (i === currentLesson) {
                return name === 'text'
                    ? { ...lesson, text }
                    : { ...lesson, [name]: value };
            }
            return lesson;
        });
        setLessons(updatedLessons);
    };

    const changeCurrentLesson = (index: number) => {
        setCurrentLesson(index);
    };

    const addLesson = () => {
        setLessons((prev) => [
            ...prev,
            {
                id: `${Math.floor(Math.random() * 1000 + 1)}`,
                title: "",
                slug: "",
                preamble: "",
                text: [],
                comments: [],
                order: `${lessons.length}`,
            },
        ]);
        setCurrentLesson(lessons.length);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:3999/api/categories");
                const data: GetCategoriesResponse = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            <nav className="mb-8 flex w-full">
                <ul data-testid="steps" className="flex w-full">
                    {courseCreateSteps?.map((courseStep, index) => (
                        <button
                            type="button"
                            data-testid="step"
                            key={courseStep.name}
                            onClick={() => handleStep(index)}
                            className={`h-12 w-1/4 border border-slate-200 ${step === courseStep.name
                                ? "border-transparent bg-slate-400"
                                : "bg-transparent"
                                }`}
                        >
                            {courseStep.name}
                        </button>
                    ))}
                    <button
                        disabled={
                            lessons?.length === 0 ||
                            !(isValid(lessons) && isValid(courseFields))
                        }
                        data-testid="form_submit"
                        type="button"
                        onClick={handleSubmit}
                        className="h-12 w-1/4 border border-slate-200 bg-emerald-300 disabled:bg-transparent disabled:opacity-50"
                    >
                        Publiser
                    </button>
                </ul>
            </nav>

            <h2 className="text-xl font-bold" data-testid="title">
                Lag nytt kurs
            </h2>
            <form className="mt-8 max-w-4xl" data-testid="form" noValidate>
                {current === 0 ? (
                    <div data-testid="course_step" className="max-w-lg">
                        <label className="mb-4 flex flex-col" htmlFor="title">
                            <span className="mb-1 font-semibold">Tittel*</span>
                            <input
                                className="rounded"
                                data-testid="form_title"
                                type="text"
                                name="title"
                                id="title"
                                value={courseFields?.title}
                                onChange={handleCourseFieldChange}
                            />
                        </label>
                        <label className="mb-4 flex flex-col" htmlFor="slug">
                            <span className="mb-1 font-semibold">Slug*</span>
                            <input
                                className="rounded"
                                data-testid="form_slug"
                                type="text"
                                name="slug"
                                id="slug"
                                value={courseFields?.slug}
                                onChange={handleCourseFieldChange}
                            />
                        </label>
                        <label className="mb-4 flex flex-col" htmlFor="description">
                            <span className="mb-1 font-semibold">Beskrivelse*</span>
                            <input
                                className="rounded"
                                data-testid="form_description"
                                type="text"
                                name="description"
                                id="description"
                                value={courseFields?.description}
                                onChange={handleCourseFieldChange}
                            />
                        </label>
                        <label className="mb-4 flex flex-col" htmlFor="category">
                            <span className="mb-1 font-semibold">Kategori*</span>
                            <select
                                className="rounded"
                                data-testid="form_category"
                                name="category"
                                id="category"
                                value={courseFields?.category}
                                onChange={handleCourseFieldChange}
                            >
                                <option disabled value="">Velg kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                ) : null}

                {current === 1 ? (
                    <div data-testid="lesson_step" className="grid w-full grid-cols-[350px_minmax(50%,_1fr)] gap-12">
                        <aside className="border-r border-slate-200 pr-6">
                            <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
                            <ul data-testid="lessons">
                                {lessons?.map((lesson, index) => (
                                    <li
                                        className={`mb-4 w-full rounded px-4 py-2 text-base ${index === currentLesson
                                            ? "border border-transparent bg-emerald-200"
                                            : "border border-slate-300 bg-transparent"
                                            }`}
                                        key={lesson?.id ?? index}
                                    >
                                        <button
                                            type="button"
                                            data-testid="select_lesson_btn"
                                            className="w-full max-w-full truncate pr-2 text-left"
                                            onClick={() => changeCurrentLesson(index)}
                                        >
                                            {lesson?.title || `Leksjon ${index + 1}`}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex">
                                <button
                                    className="w-full bg-slate-100 px-2 py-2"
                                    type="button"
                                    onClick={addLesson}
                                    data-testid="form_lesson_add"
                                >
                                    + Ny leksjon
                                </button>
                            </div>
                        </aside>

                        {lessons?.length > 0 && (
                            <div className="w-full">
                                <label className="mb-4 flex flex-col" htmlFor="title">
                                    <span className="mb-1 font-semibold">Tittel*</span>
                                    <input
                                        className="rounded"
                                        data-testid="form_lesson_title"
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={lessons[currentLesson]?.title}
                                        onChange={(e) => handleLessonFieldChange(e, 0)}
                                    />
                                </label>
                                <label className="mb-4 flex flex-col" htmlFor="slug">
                                    <span className="mb-1 font-semibold">Slug*</span>
                                    <input
                                        className="rounded"
                                        data-testid="form_lesson_slug"
                                        type="text"
                                        name="slug"
                                        id="slug"
                                        value={lessons[currentLesson]?.slug}
                                        onChange={(e) => handleLessonFieldChange(e, 0)}
                                    />
                                </label>
                                <label className="mb-4 flex flex-col" htmlFor="preamble">
                                    <span className="mb-1 font-semibold">Ingress*</span>
                                    <input
                                        className="rounded"
                                        data-testid="form_lesson_preAmble"
                                        type="text"
                                        name="preamble"
                                        id="preamble"
                                        value={lessons[currentLesson]?.preamble}
                                        onChange={(e) => handleLessonFieldChange(e, 0)}
                                    />
                                </label>

                                {(lessons[currentLesson]?.text ?? []).length > 1 ? (
                                    lessons[currentLesson]?.text?.map((field, index) => (
                                        <div key={field?.id}>
                                            <label className="mt-4 flex flex-col" htmlFor={`text-${field?.id}`}>
                                                <span className="text-sm font-semibold">Tekst*</span>
                                                <textarea
                                                    data-testid="form_lesson_text"
                                                    name="text"
                                                    id={`text-${field?.id}`}
                                                    value={field?.text}
                                                    onChange={(e) => handleLessonFieldChange(e, index)}
                                                    className="w-full rounded bg-slate-100"
                                                    cols={30}
                                                />
                                            </label>
                                            <button
                                                className="text-sm font-semibold text-red-400"
                                                type="button"
                                                onClick={() => removeTextBox(index)}
                                            >
                                                Fjern
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <label className="mb-4 flex flex-col" htmlFor="text">
                                        <span className="mb-1 text-sm font-semibold">Tekst*</span>
                                        <textarea
                                            data-testid="form_lesson_text"
                                            name="text"
                                            id="text"
                                            value={lessons[currentLesson]?.text?.[0]?.text}
                                            onChange={(e) => handleLessonFieldChange(e, 0)}
                                            className="w-full rounded bg-slate-100"
                                            cols={30}
                                        />
                                    </label>
                                )}

                                <button
                                    className="mt-6 w-full rounded bg-gray-300 px-4 py-3 font-semibold"
                                    type="button"
                                    onClick={addTextBox}
                                    data-testid="form_lesson_add_text"
                                >
                                    + Legg til tekstboks
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}

                {current === 2 ? (
                    <section data-testid="review">
                        <h3 data-testid="review_course" className="mt-4 text-lg font-bold">Kurs</h3>
                        <p data-testid="review_course_title">Tittel: {courseFields?.title}</p>
                        <p data-testid="review_course_slug">Slug: {courseFields?.slug}</p>
                        <p data-testid="review_course_description">Beskrivelse: {courseFields?.description}</p>
                        <p data-testid="review_course_category">Kategori: {courseFields?.category}</p>

                        <h3 data-testid="review_course_lessons" className="mt-4 text-lg font-bold">
                            Leksjoner ({lessons?.length})
                        </h3>
                        <ul data-testid="review_lessons" className="list-decimal pl-4">
                            {lessons?.map((lesson, index) => (
                                <li className="mt-2 mb-8 list-item" key={`${lesson?.slug}-${index}`}>
                                    <p data-testid="review_lesson_title">Tittel: {lesson?.title}</p>
                                    <p data-testid="review_lesson_slug">Slug: {lesson?.slug}</p>
                                    <p data-testid="review_lesson_preamble">Ingress: {lesson?.preamble}</p>
                                    <p>Tekster:</p>
                                    <ul data-testid="review_lesson_texts" className="list-inside">
                                        {lesson?.text?.map((text) => (
                                            <li data-testid="review_lesson_text" className="mb-1 pl-4" key={text?.id}>
                                                {text?.text}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {formError && <p data-testid="form_error">Fyll ut alle felter med *</p>}
                {success && (
                    <p className="text-emerald-600" data-testid="form_success">
                        Skjema sendt
                    </p>
                )}
            </form>
        </>
    );
}

export default Create;