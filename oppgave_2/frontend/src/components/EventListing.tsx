import React, { useState } from 'react';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import Loading from './loading-states/loading';
import Error from './loading-states/error';

const EventListing = () => {
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [selectedType, setSelectedType] = useState('all');

    const filters = {
        month: selectedMonth,
        year: selectedYear,
        event_type: selectedType !== 'all' ? selectedType : undefined
    };

    const { events, isLoading, error } = useEvents(filters);

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Filters */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="p-2 border rounded"
                        value={selectedMonth || 'all'}
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? undefined : Number(e.target.value))}
                    >
                        <option value="all">Any Month</option>
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={selectedYear || 'all'}
                        onChange={(e) => setSelectedYear(e.target.value === 'all' ? undefined : Number(e.target.value))}
                    >
                        <option value="all">Any Year</option>
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Conference">Conference</option>
                        <option value="Seminar">Seminar</option>
                    </select>
                </div>
            </div>

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