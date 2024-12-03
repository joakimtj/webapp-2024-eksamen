import Course from "@/components/Course";

export default async function Page({
    params,
}: {
    params: Promise<{ courseSlug: string, lessonSlug: string }>
}) {
    const courseSlug = (await params).courseSlug
    const lessonSlug = (await params).lessonSlug
    return (
        <main className="h-full">
            <Course courseSlug={courseSlug} lessonSlug={lessonSlug} />
        </main>
    );
}
