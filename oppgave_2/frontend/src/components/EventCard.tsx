import { Calendar, MapPin, Users } from 'lucide-react';
import { Event } from '@/types/Event';

interface EventCardProps extends Event { } // Alternatively type EventCardProps = Event;

export const EventCard = (event: EventCardProps) => {
    // const [showRegistration, setShowRegistration] = useState(false);

    const availableSpots = event.capacity - event.registered;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
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
                                <Users className="w-5 h-5 text-gray-400" />
                                <span>{availableSpots} available spots</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xl font-bold mb-2">
                            {event.price} NOK
                        </div>
                        <a href={event.slug}>
                            <button
                                onClick={() => { }}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                Register
                            </button>
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};