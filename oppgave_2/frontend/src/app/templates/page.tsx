'use client';

import { useState } from 'react';
import { TemplateGrid } from '@/components/TemplateGrid';
import { CreateTemplateForm } from '@/components/CreateTemplateForm';

import { useTemplates } from '@/hooks/useTemplates';
import Loading from '@/components/loading-states/loading';
import Error from '@/components/loading-states/error';
import { CreateEventStandaloneForm } from '@/components/CreateEventStandaloneForm';


type FormView = 'templates' | 'newTemplate' | 'newEvent';

export default function TemplatesPage() {
    const { templates, isLoading, error } = useTemplates();
    const [view, setView] = useState<FormView>('templates');

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setView('templates')}
                    className={`px-4 py-2 rounded ${view === 'templates'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    View Templates
                </button>
                <button
                    onClick={() => setView('newTemplate')}
                    className={`px-4 py-2 rounded ${view === 'newTemplate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Create Template
                </button>
                <button
                    onClick={() => setView('newEvent')}
                    className={`px-4 py-2 rounded ${view === 'newEvent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Create Event
                </button>
            </div>

            {view === 'templates' && <TemplateGrid templates={templates} />}
            {view === 'newTemplate' && <CreateTemplateForm />}
            {view === 'newEvent' && <CreateEventStandaloneForm />}
        </div>
    );
}