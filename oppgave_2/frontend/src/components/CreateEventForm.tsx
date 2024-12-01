import React, { useState } from 'react';
import { endpoints } from '@/config/urls';
import { Template } from '@/types';

interface CreateEventFormProps {
    template: Template;
}

export const CreateEventForm = ({ template }: CreateEventFormProps) => {
    const rules = JSON.parse(template.rules);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: rules.hasFixedCapacity ? rules.fixedCapacity : template.default_capacity,
        price: rules.hasFixedPrice ? rules.fixedPrice :
            rules.isFree ? 0 : template.default_price,
        event_type: template.event_type,
        isPublic: !rules.isPrivate,
        template_id: template.id
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Generate slug from title
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        try {
            const response = await fetch(endpoints.createEvent, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    slug
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }

            // Redirect to the new event page
            window.location.href = `/events/${slug}`;
        } catch (err) {
            alert('Failed to create event: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input
                    type="text"
                    name="title"
                    placeholder="Event Title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <textarea
                    name="description"
                    placeholder="Event Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded h-32"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                    required
                />

                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                    required
                />

                {!rules.hasFixedCapacity && (
                    <input
                        type="number"
                        name="capacity"
                        placeholder="Capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />
                )}

                {!rules.hasFixedPrice && !rules.isFree && (
                    <input
                        type="number"
                        name="price"
                        placeholder="Price (NOK)"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />
                )}
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Create Event
            </button>
        </form>
    );
};