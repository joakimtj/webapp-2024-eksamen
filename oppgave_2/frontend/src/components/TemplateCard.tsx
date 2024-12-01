import React, { useState } from 'react';
import { Template } from '@/types';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { CreateEventForm } from './CreateEventForm';
import { endpoints } from '@/config/urls';

interface TemplateCardProps {
    template: Template;
    onDelete?: () => void;
}

export const TemplateCard = ({ template, onDelete }: TemplateCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const rules = JSON.parse(template.rules);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${endpoints.getTemplates}/${template.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error.message);
            }

            onDelete?.();
        } catch (err) {
            // If it's the specific error about events using the template
            if (err instanceof Error && err.message.includes('events using this template')) {
                alert('Cannot delete template: There are events currently using this template');
            } else {
                alert('Failed to delete template: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center">
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    {template.event_type}
                                </span>
                            </div>
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete template"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Template Rules:</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {rules.noSameDayEvents && (
                                    <li>• No other events allowed on the same day</li>
                                )}
                                {rules.allowedWeekDays && (
                                    <li>• Only allowed on: {rules.allowedWeekDays.map(day =>
                                        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                                    ).join(', ')}</li>
                                )}
                                {rules.isPrivate && <li>• Private event</li>}
                                {rules.hasFixedCapacity && (
                                    <li>• Fixed capacity: {rules.fixedCapacity} attendees</li>
                                )}
                                {rules.hasFixedPrice && (
                                    <li>• Fixed price: {rules.fixedPrice} NOK</li>
                                )}
                                {rules.isFree && <li>• Free event</li>}
                                {rules.hasWaitingList && <li>• Has waiting list</li>}
                            </ul>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-4">Create Event from Template</h4>
                            <CreateEventForm template={template} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};