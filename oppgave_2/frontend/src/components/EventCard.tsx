import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types/Event';
import Link from 'next/link';

interface EventCardProps extends Event {
    isAdmin: boolean;
} // Alternatively type EventCardProps = Event;

export const EventCard = (event: EventCardProps) => {
    // const [showRegistration, setShowRegistration] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="mb-4">
                            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                {event.event_type}
                            </span>
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