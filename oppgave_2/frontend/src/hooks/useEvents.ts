import { useState, useEffect } from 'react';
import type { Event } from '@/types/Event';
import type { Result } from '@/types';
import { endpoints } from '@/config/urls';

interface FilterParams {
    month?: number;
    year?: number;
    event_type?: string;
}

export const useEvents = (filters?: FilterParams) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (filters?.month) queryParams.append('month', filters.month.toString());
                if (filters?.year) queryParams.append('year', filters.year.toString());
                if (filters?.event_type) queryParams.append('event_type', filters.event_type);

                const url = filters ? `${endpoints.getEvents}?${queryParams.toString()}` : endpoints.getEvents;
                const response = await fetch(url);
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
    }, [filters?.month, filters?.year, filters?.event_type]);

    return { events, isLoading, error };
};