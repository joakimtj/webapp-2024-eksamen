import { useState, useEffect } from 'react';
import type { Event } from '@/types/Event';
import type { Result } from '@/types';
import { endpoints } from '@/config/urls';

export const useEvent = (slug: string) => {
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${endpoints.getEvent}/${slug}`);
                const responseText = await response.text(); // Add this line
                console.log('Raw response:', responseText); // Add this

                const result = JSON.parse(responseText) as Result<Event>;
                if (!result.success) {
                    throw new Error(result.error.message);
                }
                setEvent(result.data);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch event');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [slug]);

    return { event, isLoading, error };
};