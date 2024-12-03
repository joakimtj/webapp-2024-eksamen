import React from 'react';
import { Template } from '@/types';
import { TemplateCard } from './TemplateCard';


interface TemplateGridProps {
    templates: Template[];
}

export const TemplateGrid = ({ templates }: TemplateGridProps) => {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Event Templates</h2>
            <div className="grid grid-cols-1 gap-6">
                {templates.map(template => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </div>
        </div>
    );
};