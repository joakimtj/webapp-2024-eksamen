import React from 'react';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';

const EventListing = () => {
    const { events, isLoading, error } = useEvents();

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-lg font-medium text-gray-600">Loading events...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[200px] bg-red-50 rounded-lg">
            <div className="text-lg font-medium text-red-600">Error: {error}</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-6">
                {events.map(event => (
                    <EventCard
                        key={event.id}
                        {...event}
                        event_type={event.event_type}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventListing;