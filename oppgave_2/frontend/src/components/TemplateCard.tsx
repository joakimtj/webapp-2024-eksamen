import React, { useState } from 'react';
import { Template } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CreateEventForm } from './CreateEventForm';

interface TemplateCardProps {
    template: Template;
}

export const TemplateCard = ({ template }: TemplateCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const rules = JSON.parse(template.rules);

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div>
                        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {template.event_type}
                        </span>
                    </div>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
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