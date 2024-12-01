'use client';

import Loading from "@/components/loading-states/loading";
import Error from "@/components/loading-states/error";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateGrid } from "@/components/TemplateGrid";

export default function TemplatesPage() {
    const { templates, isLoading, error } = useTemplates();

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return <TemplateGrid templates={templates} />;
}