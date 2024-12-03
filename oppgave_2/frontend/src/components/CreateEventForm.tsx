import React, { useState } from 'react';
import { endpoints } from '@/config/urls';
import { Template, TemplateRules } from '@/types';

const WEEKDAYS = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' }
];

interface CreateEventFormProps {
    template: Template;
    onTemplateUpdate?: () => void;  // Add this prop
}

export const CreateEventForm = ({ template, onTemplateUpdate }: CreateEventFormProps) => {
    const rules: TemplateRules = JSON.parse(template.rules);
    const [formData, setFormData] = useState({
        title: template.name,
        description: '',
        date: '',
        location: '',
        capacity: rules.hasFixedCapacity ? rules.fixedCapacity : template.default_capacity,
        price: rules.hasFixedPrice ? rules.fixedPrice : template.default_price,
        event_type: template.event_type,
        isPublic: !rules.isPrivate,  // Now correctly using the template rule
        template_id: template.id
    });

    const [templateRules, setTemplateRules] = useState<TemplateRules>({
        noSameDayEvents: rules.noSameDayEvents || false,
        allowedWeekDays: rules.allowedWeekDays || [],
        isPrivate: rules.isPrivate || false,
        hasFixedCapacity: rules.hasFixedCapacity || false,
        fixedCapacity: rules.fixedCapacity || template.default_capacity,
        hasFixedPrice: rules.hasFixedPrice || false,
        fixedPrice: rules.fixedPrice || template.default_price,
    });

    // Add new state for weekday selection toggle
    const [enableWeekdayRestriction, setEnableWeekdayRestriction] = useState(
        rules.allowedWeekDays && rules.allowedWeekDays.length > 0
    );

    const handleWeekdayToggle = (dayId: number) => {
        setTemplateRules(prev => ({
            ...prev,
            allowedWeekDays: prev.allowedWeekDays?.includes(dayId)
                ? prev.allowedWeekDays.filter(d => d !== dayId)
                : [...(prev.allowedWeekDays || []), dayId]
        }));
    };

    const handleWeekdayRestrictionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnableWeekdayRestriction(e.target.checked);
        if (!e.target.checked) {
            setTemplateRules(prev => ({
                ...prev,
                allowedWeekDays: []
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate selected date against allowed weekdays
        if (templateRules.allowedWeekDays) {
            if (templateRules.allowedWeekDays?.length > 0) {
                const eventDate = new Date(formData.date);
                const eventDay = eventDate.getDay();
                if (!templateRules.allowedWeekDays.includes(eventDay)) {
                    const allowedDays = templateRules.allowedWeekDays
                        .map(day => WEEKDAYS[day].name)
                        .join(', ');
                    alert(`Events can only be scheduled on: ${allowedDays}`);
                    return;
                }
            }
        }

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

    const [isEditingTemplate, setIsEditingTemplate] = useState(false);

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
            window.location.reload(); // Add page reload here
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
                                        checked={enableWeekdayRestriction}
                                        onChange={handleWeekdayRestrictionToggle}
                                    />
                                    Restrict to specific weekdays
                                </label>

                                {enableWeekdayRestriction && (
                                    <div className="ml-6 space-y-2">
                                        {WEEKDAYS.map(day => (
                                            <label key={day.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={templateRules.allowedWeekDays?.includes(day.id)}
                                                    onChange={() => handleWeekdayToggle(day.id)}
                                                />
                                                {day.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
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