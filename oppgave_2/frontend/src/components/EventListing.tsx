import React, { useState } from 'react';
import { EventCard } from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';
import Loading from './loading-states/loading';
import Error from './loading-states/error';
import { useFilterOptions } from '@/hooks/useFilterOptions';

const EventListing = () => {
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [selectedType, setSelectedType] = useState('all');

    const { options, isLoading: optionsLoading } = useFilterOptions();
    const filters = {
        month: selectedMonth,
        year: selectedYear,
        event_type: selectedType !== 'all' ? selectedType : undefined
    };

    const { events, isLoading: eventsLoading, error } = useEvents(filters);

    if (eventsLoading || optionsLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="p-2 border rounded"
                        value={selectedMonth || 'all'}
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? undefined : Number(e.target.value))}
                    >
                        <option value="all">Any Month</option>
                        {options.months.map((month) => (
                            <option key={month} value={month}>
                                {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={selectedYear || 'all'}
                        onChange={(e) => setSelectedYear(e.target.value === 'all' ? undefined : Number(e.target.value))}
                    >
                        <option value="all">Any Year</option>
                        {options.years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        {options.event_types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {events.map(event => (
                    <EventCard key={event.id} {...event} event_type={event.event_type} />
                ))}
            </div>
        </div>
    );
};

export default EventListing;