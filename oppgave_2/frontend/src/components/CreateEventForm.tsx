import React, { useState } from 'react';
import { endpoints } from '@/config/urls';
import { Template, TemplateRules } from '@/types';

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

    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [templateRules, setTemplateRules] = useState<TemplateRules>({
        noSameDayEvents: false,
        allowedWeekDays: [],
        isPrivate: false,
        hasFixedCapacity: false,
        fixedCapacity: template.default_capacity,
        hasFixedPrice: false,
        fixedPrice: template.default_price,
        isFree: false,
        hasWaitingList: false
    });

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setTemplateRules(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTemplateSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${endpoints.createTemplate}/${template.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...template,
                    rules: JSON.stringify(templateRules)
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }

            alert('Template updated successfully');
            setIsEditingTemplate(false);
        } catch (err) {
            alert('Failed to update template: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    return (
        <div className="space-y-6">
            {/* Template Rules Section */}
            <div className="border-t pt-4">
                <button
                    type="button"
                    onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {isEditingTemplate ? 'Cancel Template Edit' : 'Edit Template Rules'}
                </button>

                {isEditingTemplate && (
                    <form onSubmit={handleTemplateSave} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="noSameDayEvents"
                                        checked={templateRules.noSameDayEvents}
                                        onChange={handleRuleChange}
                                    />
                                    No same day events
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isPrivate"
                                        checked={templateRules.isPrivate}
                                        onChange={handleRuleChange}
                                    />
                                    Private event
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="hasWaitingList"
                                        checked={templateRules.hasWaitingList}
                                        onChange={handleRuleChange}
                                    />
                                    Enable waiting list
                                </label>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="hasFixedCapacity"
                                            checked={templateRules.hasFixedCapacity}
                                            onChange={handleRuleChange}
                                        />
                                        Fixed capacity
                                    </label>
                                    {templateRules.hasFixedCapacity && (
                                        <input
                                            type="number"
                                            name="fixedCapacity"
                                            value={templateRules.fixedCapacity}
                                            onChange={handleRuleChange}
                                            className="mt-2 p-2 border rounded w-full"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="hasFixedPrice"
                                            checked={templateRules.hasFixedPrice}
                                            onChange={handleRuleChange}
                                        />
                                        Fixed price
                                    </label>
                                    {templateRules.hasFixedPrice && (
                                        <input
                                            type="number"
                                            name="fixedPrice"
                                            value={templateRules.fixedPrice}
                                            onChange={handleRuleChange}
                                            className="mt-2 p-2 border rounded w-full"
                                        />
                                    )}
                                </div>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isFree"
                                        checked={templateRules.isFree}
                                        onChange={handleRuleChange}
                                    />
                                    Free event
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Save Template Rules
                        </button>
                    </form>
                )}
            </div>
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
        </div>
    );
};