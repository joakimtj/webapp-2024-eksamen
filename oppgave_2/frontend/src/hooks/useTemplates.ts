import { endpoints } from "@/config/urls";
import { Result } from "@/types";
import { useEffect, useState } from "react";

interface Template {
    id: string;
    name: string;
    event_type: string;
    default_capacity: number;
    default_price: number;
    rules: string;
    created_at: string;
    updated_at: string;
}


export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch(endpoints.getTemplates);
                const result = await response.json() as Result<Template[]>;

                if (!result.success) {
                    throw new Error(result.error.message);
                }

                setTemplates(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch templates');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return { templates, isLoading, error };
};