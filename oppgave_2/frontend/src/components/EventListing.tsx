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
    const [showRoleSelector, setShowRoleSelector] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // When setting admin status
    const handleAdminClick = () => {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        setShowRoleSelector(false);
        refresh(); // Add this line to trigger re-fetch
    };

    const handleUserClick = () => {
        setIsAdmin(false);
        localStorage.setItem('isAdmin', 'false');
        setShowRoleSelector(false);
        refresh(); // Add this line to trigger re-fetch
    };

    const { options, isLoading: optionsLoading } = useFilterOptions();
    const filters = {
        month: selectedMonth,
        year: selectedYear,
        event_type: selectedType !== 'all' ? selectedType : undefined,
        isAdmin: isAdmin.toString() // Convert boolean to string explicitly
    };

    const { events, isLoading: eventsLoading, error, refresh } = useEvents(filters);

    if (eventsLoading || optionsLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="relative">

            {/* Role Selector Overlay */}
            {showRoleSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                    <div className="relative bg-white p-6 rounded-lg shadow-xl flex gap-4">
                        <button
                            onClick={() => {
                                handleAdminClick();
                                setShowRoleSelector(false);
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => {
                                handleUserClick();
                                setShowRoleSelector(false);
                            }}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            User
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`max-w-6xl mx-auto p-6 ${showRoleSelector ? 'blur-sm' : ''}`}>
                {isAdmin && (
                    <div className="mb-4 flex justify-start">
                        <button
                            onClick={() => window.location.href = '/templates'}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Manage Templates
                        </button>
                    </div>
                )}
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
                    {events.map(event => {
                        if (!isAdmin && !event.isPublic) return null;
                        return (
                            <EventCard
                                key={event.id}
                                {...event}
                                event_type={event.event_type}
                                isAdmin={isAdmin}
                                onDelete={refresh}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EventListing;