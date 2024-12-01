import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Banknote, Pencil, X, Save } from 'lucide-react';
import { Event } from '@/types/Event';
import RegistrationForm from '@/components/RegistrationForm';
import { endpoints } from '@/config/urls';
import RegistrationList from './RegistrationList';

interface EventPageProps extends Event {
    isAdmin: boolean;
}

export const EventPage = ({
    id,
    title,
    description,
    date,
    location,
    capacity,
    price,
    event_type: type,
    slug,
    isPublic,
    template_id,
    isAdmin,
}: EventPageProps) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title,
        description,
        date,
        location,
        capacity,
        price,
        event_type: type
    });

    if (price == null) price = 0;

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${endpoints.getEvents}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm)
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }

            window.location.reload();
        } catch (err) {
            alert('Failed to update event: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {isAdmin && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="float-right p-2 text-blue-600 hover:text-blue-800"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="event_type"
                                    value={editForm.event_type}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded mb-4"
                                    placeholder="Event Type"
                                />
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleInputChange}
                                    className="w-full text-3xl font-bold p-2 border rounded"
                                    placeholder="Event Title"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={editForm.date.slice(0, 16)}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    name="location"
                                    value={editForm.location}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded"
                                    placeholder="Location"
                                />
                                <input
                                    type="number"
                                    name="price"
                                    value={editForm.price ?? 0}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded"
                                    placeholder="Price (NOK)"
                                />
                                <input
                                    type="number"
                                    name="capacity"
                                    value={editForm.capacity}
                                    onChange={handleInputChange}
                                    className="p-2 border rounded"
                                    placeholder="Capacity"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-green-600 hover:text-green-800"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
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
                                {price > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-5 h-5" />
                                        <span>{price} NOK</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">About this event</h2>
                    {isEditing ? (
                        <textarea
                            name="description"
                            value={editForm.description ?? ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded h-32"
                            placeholder="Event description"
                        />
                    ) : (
                        <p className="whitespace-pre-wrap">{description}</p>
                    )}
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
            <div>
                {isAdmin && <RegistrationList eventId={id} />}
            </div>
        </div>
    );
};