import { Calendar, MapPin, Users, Trash2 } from 'lucide-react';
import { Event } from '@/types/Event';
import Link from 'next/link';
import { useState } from 'react';
import { endpoints } from '@/config/urls';

interface EventCardProps extends Event {
    isAdmin: boolean;
    onDelete?: () => void;  // Add callback for parent component refresh
}

export const EventCard = (event: EventCardProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${endpoints.getEvents}/${event.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error.message);
            }

            event.onDelete?.();  // Notify parent component
        } catch (err) {
            alert('Failed to delete event: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                {event.event_type}
                            </span>
                            {event.isAdmin && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                                    title="Delete event"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                        <p className="text-gray-600 mb-4">{event.description}</p>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <span>{event.location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href={`/events/${event.slug}`}
                                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                                    Go to event
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xl font-bold mb-2">
                            {event.price} NOK
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};