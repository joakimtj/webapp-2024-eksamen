import { endpoints } from "@/config/urls";
import { Result } from "@/types";
import { useEffect, useState } from "react";

interface FilterOptions {
    event_types: string[];
    years: number[];
    months: number[];
}

export const useFilterOptions = () => {
    const [options, setOptions] = useState<FilterOptions>({
        event_types: [],
        years: [],
        months: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch(`${endpoints.getEvents}/filters`);
                const result = await response.json() as Result<FilterOptions>;

                if (!result.success) {
                    throw new Error(result.error.message);
                }

                setOptions(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { options, isLoading, error };
};