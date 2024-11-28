import React from 'react';
import { EventCard } from '@/components/EventCard';

// Sample data structure
const sampleEvents = [
    {
        id: 1,
        title: "Summer Workshop 2024",
        description: "Join us for an exciting workshop experience",
        date: "2024-06-15",
        location: "Oslo Event Center",
        type: "Workshop",
        capacity: 50,
        registered: 30,
        price: 1500,
        slug: "summer-workshop-2024"
    },
    {
        id: 2,
        title: "Tech Conference",
        description: "Annual technology conference",
        date: "2024-07-20",
        location: "Bergen Conference Hall",
        type: "Conference",
        capacity: 200,
        registered: 150,
        price: 2500,
        slug: "tech-conference-2024"
    }
];

const EventListing = () => {
    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Event Cards */}
            <div className="grid grid-cols-1 gap-6">
                {sampleEvents.map(event => (
                    <EventCard key={event.id} id={event.id} registered={event.registered}
                        title={event.title} description={event.description} date={event.date} location={event.location}
                        event_type={event.type} capacity={event.capacity} price={event.price} slug={event.slug} />
                ))}
            </div>
        </div>
    );
};

export default EventListing;