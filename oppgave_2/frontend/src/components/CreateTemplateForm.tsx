import React, { useState } from 'react';
import { endpoints } from '@/config/urls';
import { TemplateRules } from '@/types';

export const CreateTemplateForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        event_type: '',
        default_capacity: 0,
        default_price: 0,
    });

    const [templateRules, setTemplateRules] = useState<TemplateRules>({
        noSameDayEvents: false,
        allowedWeekDays: [],
        isPrivate: false,
        hasFixedCapacity: false,
        fixedCapacity: 0,
        hasFixedPrice: false,
        fixedPrice: 0,
        isFree: false,
        hasWaitingList: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(endpoints.createTemplate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    rules: JSON.stringify(templateRules)
                })
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }

            // Reset form or redirect
            window.location.reload();
        } catch (err) {
            alert('Failed to create template: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setTemplateRules(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Create New Template</h2>

            <div className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Template Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                />

                <input
                    type="text"
                    name="event_type"
                    placeholder="Event Type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="default_capacity"
                        placeholder="Default Capacity"
                        value={formData.default_capacity}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />

                    <input
                        type="number"
                        name="default_price"
                        placeholder="Default Price"
                        value={formData.default_price}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                        required
                    />
                </div>

                {/* Template Rules Section */}
                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Template Rules</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Left Column */}
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
                        {/* Right Column */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="hasFixedCapacity"
                                    checked={templateRules.hasFixedCapacity}
                                    onChange={handleRuleChange}
                                />
                                Fixed capacity
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="hasFixedPrice"
                                    checked={templateRules.hasFixedPrice}
                                    onChange={handleRuleChange}
                                />
                                Fixed price
                            </label>
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
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
                Create Template
            </button>
        </form>
    );
};