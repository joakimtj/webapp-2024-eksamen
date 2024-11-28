import React, { useState } from 'react';
import { endpoints } from '@/config/urls';

interface RegistrationFormProps {
    onClose: () => void;
    eventId: string;
    price: number;
}

const RegistrationForm = ({ onClose, eventId, price }: RegistrationFormProps) => {
    const [attendees, setAttendees] = useState([{ name: '', email: '', phone: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addAttendee = () => {
        setAttendees([...attendees, { name: '', email: '', phone: '' }]);
    };

    const updateAttendee = (index: number, field: string, value: string) => {
        const newAttendees = [...attendees];
        newAttendees[index][field] = value;
        setAttendees(newAttendees);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // First create the registration
            const registrationResponse = await fetch(endpoints.createRegistration, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_id: eventId,
                    status: 'pending',
                    total_price: price * attendees.length
                })
            });

            const registrationResult = await registrationResponse.json();

            if (!registrationResult.success) {
                throw new Error(registrationResult.error.message);
            }

            // Then create all attendees
            const attendeePromises = attendees.map(attendee =>
                fetch(endpoints.createAttendee, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registration_id: registrationResult.data.id,
                        ...attendee
                    })
                }).then(res => res.json())
            );

            const attendeeResults = await Promise.all(attendeePromises);

            // Check if any attendee creation failed
            const failedAttendees = attendeeResults.filter(result => !result.success);
            if (failedAttendees.length > 0) {
                throw new Error('Failed to register some attendees');
            }

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to complete registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Registration Form</h2>
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}
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
                        disabled={isSubmitting}
                        className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Add Attendee
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Processing...' : 'Complete Registration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;