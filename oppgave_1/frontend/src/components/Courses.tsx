"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Course, GetCategoriesResponse, GetCoursesResponse } from "../types";

function Courses() {
    const [value, setValue] = useState<string>("");
    const [data, setData] = useState<Course[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    // Add a new state variable to store the original data
    const [originalData, setOriginalData] = useState<Course[]>([]);

    const handleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
        const category = event.target.value;
        setValue(category);
        const filteredData = category
            ? originalData.filter(course => course.category === category)
            : originalData;
        setData(filteredData);
    };

    const handleDeleteCourse = async (id: string): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:3999/api/courses/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error('Failed to delete course');
            }

            const updatedData = data.filter((course) => course.id !== id);
            setData(updatedData);
            setOriginalData(prev => prev.filter(course => course.id !== id));
        } catch (error) {
            console.error('Error deleting course:', error);
            // Here you might want to add error handling UI feedback
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch courses
                const coursesResponse = await fetch("http://localhost:3999/api/courses");
                const coursesData: GetCoursesResponse = await coursesResponse.json();
                setData(coursesData);
                setOriginalData(coursesData);

                // Fetch categories
                const categoriesResponse = await fetch("http://localhost:3999/api/categories");
                const categoriesData: GetCategoriesResponse = await categoriesResponse.json();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Here you might want to add error handling UI feedback
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <header className="mt-8 flex items-center justify-between">
                <h2 className="mb-6 text-xl font-bold" data-testid="title">
                    Alle kurs
                </h2>
                <label className="flex flex-col text-xs font-semibold" htmlFor="filter">
                    <span className="sr-only mb-1 block">Velg kategori:</span>
                    <select
                        id="filter"
                        name="filter"
                        data-testid="filter"
                        value={value}
                        onChange={handleFilter}
                        className="min-w-[200px] rounded bg-slate-200"
                    >
                        <option value="">Alle</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>
            </header>
            <section className="mt-6 grid grid-cols-3 gap-8" data-testid="courses">
                {data && data.length > 0 ? (
                    data.map((course) => (
                        <article
                            className="rounded-lg border border-slate-400 px-6 py-8"
                            key={course.id}
                            data-testid="course_wrapper"
                        >
                            <span className="block text-right capitalize">
                                [{course.category}]
                            </span>
                            <h3
                                className="mb-2 text-base font-bold"
                                data-testid="courses_title"
                            >
                                <a href={`/courses/${course.slug}`}>{course.title}</a>
                            </h3>
                            <p
                                className="mb-6 text-base font-light"
                                data-testid="courses_description"
                            >
                                {course.description}
                            </p>
                            <a
                                className="font-semibold underline"
                                data-testid="courses_url"
                                href={`/courses/${course.slug}`}
                            >
                                Til kurs
                            </a>
                            <button
                                className="ml-4 text-xs font-semibold rounded px-2 py-1 bg-red-500 text-white"
                                data-testid="delete_button"
                                onClick={() => handleDeleteCourse(course.id)}
                            >
                                Slett
                            </button>
                        </article>
                    ))
                ) : (
                    <p data-testid="empty">Ingen kurs</p>
                )}
            </section>
        </>
    );
}

export default Courses;