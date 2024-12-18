import React, { useState } from 'react';
import { endpoints } from '@/config/urls';
import { Template, TemplateRules } from '@/types';



export const CreateEventStandaloneForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: 0,
        price: 0,
        event_type: '',
        isPublic: true,
        template_id: null
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
                    isPublic: formData.isPublic ? 1 : 0,  // Convert boolean to number
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
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
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
                        type="text"
                        name="event_type"
                        placeholder="Event Type"
                        value={formData.event_type}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />

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

                    <input
                        type="number"
                        name="capacity"
                        placeholder="Capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />

                    <input
                        type="number"
                        name="price"
                        placeholder="Price (NOK)"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isPublic"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                isPublic: e.target.checked
                            }))}
                            className="rounded"
                        />
                        Public Event
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create Event
                </button>
            </form>
        </div>
    );
};