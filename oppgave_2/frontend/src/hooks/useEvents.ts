import { useState, useEffect } from 'react';
import type { Event } from '@/types/Event';
import type { Result } from '@/types';
import { endpoints } from '@/config/urls';

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(endpoints.getEvents);
                const result = await response.json() as Result<Event[]>;

                if (!result.success) {
                    throw new Error(result.error.message);
                }

                setEvents(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch events');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return { events, isLoading, error };
};