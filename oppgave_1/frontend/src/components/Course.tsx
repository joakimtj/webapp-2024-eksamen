"use client"

import { useState, useEffect } from "react";
import Lesson from "./Lesson";
import { Course as CourseType, CourseProps, LessonType, GetUsersResponse } from "../types";

const getCourse = async (slug: string): Promise<CourseType> => {
    const course = await fetch(`http://localhost:3999/api/courses/${slug}`)
        .then((response) => response.json())
        .then((data: CourseType) => {
            return data;
        });
    return course;
};

const getUsers = async (): Promise<GetUsersResponse> => {
    const users = await fetch("http://localhost:3999/api/users")
        .then((response) => response.json())
        .then((data: GetUsersResponse) => {
            return data;
        });
    return users;
};

function Course({ courseSlug, lessonSlug }: CourseProps) {
    const [content, setContent] = useState<CourseType | null>(null);
    const [users, setUsers] = useState<string[]>([]);

    useEffect(() => {
        const getContent = async () => {
            const data = await getCourse(courseSlug);
            setContent(data);

            const users = await getUsers();
            setUsers(users);
        };
        getContent();
    }, [courseSlug]); // TODO: still triggers rerender on lesson change

    return (
        <div className="grid grid-cols-[250px_minmax(20%,1fr)_1fr] gap-16">
            <aside className="border-r border-slate-200 pr-6">
                <h3 className="mb-4 text-base font-bold">Leksjoner</h3>
                <ul data-testid="lessons">
                    {content?.lessons?.map((lesson) => (
                        <li
                            className={`text-sm" mb-4 w-full max-w-[95%] rounded-lg border border-slate-300 px-4 py-2 ${lessonSlug === lesson.slug ? "bg-emerald-300" : "bg-transparent"}`}
                            key={lesson.id}
                        >
                            <a
                                data-testid="lesson_url"
                                data-slug={lessonSlug}
                                className="block h-full w-full"
                                href={`/courses/${content?.slug}/${lesson.slug}`}
                            >
                                {lesson.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </aside>
            {lessonSlug ? (
                <article>
                    <Lesson courseSlug={courseSlug} lessonSlug={lessonSlug} />
                </article>
            ) : (
                <section>
                    <>
                        <h2 className="text-2xl font-bold" data-testid="course_title">
                            {content?.title}
                        </h2>
                        <p
                            className="mt-4 font-semibold leading-relaxed"
                            data-testid="course_description"
                        >
                            {content?.description}
                        </p>
                    </>
                </section>
            )}
            <aside
                data-testid="enrollments"
                className="border-l border-slate-200 pl-6"
            >
                <h3 className="mb-4 text-base font-bold">Deltakere</h3>
                <ul data-testid="course_enrollments">
                    {users?.map((user) => (
                        <li className="mb-1" key={user}>
                            {user}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}

export default Course;