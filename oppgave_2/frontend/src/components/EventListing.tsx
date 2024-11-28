import React from 'react';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import Loading from './loading-states/loading';
import Error from './loading-states/error';

const EventListing = () => {
    const { events, isLoading, error } = useEvents();

    if (isLoading) return (
        <Loading />
    );

    if (error) return (
        <Error message={error} />
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