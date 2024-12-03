import { useState, useEffect, useCallback } from 'react';
import { Template } from '@/types';
import { endpoints } from '@/config/urls';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        try {
            const response = await fetch(endpoints.getTemplates);
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }
            setTemplates(result.data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return { templates, isLoading, error, refetchTemplates: fetchTemplates };
};