import Course from "@/components/Course";

export default async function Page({
    params,
}: {
    params: Promise<{ courseSlug: string }>
}) {
    const slug = (await params).courseSlug
    return (
        <main className="h-full">
            <Course courseSlug={slug} />
        </main>
    );
}
