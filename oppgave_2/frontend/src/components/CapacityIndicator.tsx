import React, { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { endpoints } from '@/config/urls';

interface CapacityIndicatorProps {
    eventId: string;
    capacity: number;
}

export const CapacityIndicator: React.FC<CapacityIndicatorProps> = ({ eventId, capacity }) => {
    const [totalAttendees, setTotalAttendees] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCapacity = async () => {
            try {
                const response = await fetch(`${endpoints.getEvents}/capacity/${eventId}`);
                const result = await response.json();

                if (!response.ok) throw new Error(result.error?.message || 'Failed to fetch capacity');

                if (result.success) {
                    setTotalAttendees(result.data.spotsLeft); // This is actually total attendees
                } else {
                    throw new Error(result.error.message);
                }
            } catch (error) {
                console.error('Failed to fetch capacity:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch capacity');
            } finally {
                setLoading(false);
            }
        };

        fetchCapacity();
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex items-center gap-1">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || totalAttendees === null) {
        return null;
    }

    const spotsLeft = capacity - totalAttendees;
    const isFull = spotsLeft <= 0;

    return (
        <div className="flex items-center gap-1" title={`${totalAttendees} registered out of ${capacity} spots`}>
            <Users
                className={`w-5 h-5 ${isFull ? 'text-red-500' : 'text-green-500'
                    }`}
            />
            <span className={`text-sm ${isFull ? 'text-red-500' : 'text-gray-600'}`}>
                {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
            </span>
        </div>
    );
};