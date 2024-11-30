import React, { useState } from 'react';
import type { Event } from '@/types/Event';
import { endpoints } from '@/config/urls';
import { useTemplates } from '@/hooks/useTemplates';

interface EventFormData {
    title: string;
    description: string;
    event_type: string;
    date: string;
    location: string;
    capacity: number;
    price: number;
    rules: string;
}

const initialFormData: EventFormData = {
    title: '',
    description: '',
    event_type: '',
    date: '',
    location: '',
    capacity: 0,
    price: 0,
    rules: '',
};

interface EventFormProps {
    onClose?: () => void;
}

export const EventForm = ({ onClose }: EventFormProps) => {
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { templates, isLoading: templatesLoading } = useTemplates();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        if (templateId === '') {
            setFormData(initialFormData);
            return;
        }

        const selectedTemplate = templates.find(t => t.id === templateId);
        if (selectedTemplate) {
            setFormData(prev => ({
                ...prev,
                title: selectedTemplate.name,
                event_type: selectedTemplate.event_type,
                capacity: selectedTemplate.default_capacity,
                price: selectedTemplate.default_price,
                rules: selectedTemplate.rules
            }));
        }
    };
    const createEvent = async (saveAsTemplate: boolean = false) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Generate slug from title
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const response = await fetch(endpoints.createEvent, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    slug
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error.message);
            }

            if (saveAsTemplate) {
                // Create template from event data
                const templateResponse = await fetch(endpoints.createTemplate, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.title,
                        event_type: formData.event_type,
                        default_capacity: formData.capacity,
                        default_price: formData.price,
                        rules: formData.rules
                    }),
                });

                const templateResult = await templateResponse.json();
                if (!templateResult.success) {
                    throw new Error('Event created but template creation failed');
                }
            }

            onClose?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <form className="space-y-6">
                {/* Add template selector at the top */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Template (Optional)
                    </label>
                    <select
                        className="w-full p-2 border rounded"
                        onChange={handleTemplateChange}
                        disabled={templatesLoading}
                    >
                        <option value="">No Template</option>
                        {templates.map(template => (
                            <option key={template.id} value={template.id}>
                                {template.name} ({template.event_type})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
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
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded h-32"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                    </label>
                    <input
                        type="text"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleInputChange}
                        placeholder="Event Type"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date and Time
                    </label>
                    <input
                        type="datetime-local"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                    </label>
                    <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (NOK)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Optional Template Rules
                    </label>
                    <input
                        type="string"
                        name="rules"
                        value={formData.rules}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="If saving as template, provide additional rules here"
                    />
                </div>

                <div className="flex gap-4 justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => createEvent(true)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Save as Template
                    </button>
                    <button
                        type="button"
                        onClick={() => createEvent(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};