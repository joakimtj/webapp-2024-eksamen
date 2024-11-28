import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Banknote } from 'lucide-react';
import { Event } from '@/types/Event';

interface EventLandingProps extends Event { }

export const EventLanding = ({
    title,
    description,
    date,
    location,
    capacity,
    registered,
    price,
    type,
    slug
}: EventLandingProps) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const availableSpots = capacity - registered;

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
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>{availableSpots} spots available</span>
                        </div>
                        {price > 0 && (
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
                            eventId={slug}
                            price={price}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

interface RegistrationFormProps {
    onClose: () => void;
    eventId: string;
    price: number;
}

const RegistrationForm = ({ onClose, eventId, price }: RegistrationFormProps) => {
    const [attendees, setAttendees] = useState([{ name: '', email: '', phone: '' }]);

    const addAttendee = () => {
        setAttendees([...attendees, { name: '', email: '', phone: '' }]);
    };

    const updateAttendee = (index: number, field: string, value: string) => {
        const newAttendees = [...attendees];
        newAttendees[index][field] = value;
        setAttendees(newAttendees);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle registration submission
        console.log('Registration submitted:', { eventId, attendees });
        onClose();
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {attendees.map((attendee, index) => (
                    <div key={index} className="space-y-4">
                        <h3 className="font-medium">Attendee {index + 1}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={attendee.name}
                                onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={attendee.email}
                                onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                                className="p-2 border rounded"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={attendee.phone}
                                onChange={(e) => updateAttendee(index, 'phone', e.target.value)}
                                className="p-2 border rounded"
                                required
                            />
                        </div>
                    </div>
                ))}

                {price > 0 && (
                    <div className="border-t pt-4">
                        <p className="font-medium">Total Price: {price * attendees.length} NOK</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={addAttendee}
                        className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
                    >
                        Add Attendee
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Complete Registration
                    </button>
                </div>
            </form>
        </div>
    );
};