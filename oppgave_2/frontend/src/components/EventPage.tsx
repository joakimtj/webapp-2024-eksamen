import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Banknote } from 'lucide-react';
import { Event } from '@/types/Event';
import RegistrationForm from '@/components/RegistrationForm';

interface EventPageProps extends Event { }

export const EventPage = ({
    id,
    title,
    description,
    date,
    location,
    capacity,
    price,
    event_type: type,
    slug
}: EventPageProps) => {
    const [isRegistering, setIsRegistering] = useState(false);

    if (price == null) price = 0;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-4">
                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {type}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{title}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{new Date(date).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>{location}</span>
                        </div>

                        {price != null && price > 0 && (
                            <div className="flex items-center gap-2">
                                <Banknote className="w-5 h-5" />
                                <span>{price} NOK</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">About this event</h2>
                    <p className="whitespace-pre-wrap">{description}</p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {!isRegistering ? (
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-4">Join this event</h2>
                            <button
                                onClick={() => setIsRegistering(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Register Now
                            </button>
                        </div>
                    ) : (
                        <RegistrationForm
                            onClose={() => setIsRegistering(false)}
                            eventId={id}
                            price={price}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};