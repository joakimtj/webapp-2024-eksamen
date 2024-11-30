'use client';

import { EventPage } from "@/components/EventPage";
import { useEvent } from '@/hooks/useEvent';
import React, { useState } from "react";
import Error from '@/components/loading-states/error';
import Loading from '@/components/loading-states/loading';

type Props = {
    params: {
        eventSlug: string;
    };
};

export default function Page({ params }: Props) {
    // This would need to come from wherever you're storing the admin state
    // For example, if you're storing it in localStorage or a context
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        // If you're storing in localStorage
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isAdmin') === 'true';
        }
        return false;
    });

    const { event, isLoading, error } = useEvent(params.eventSlug);

    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;
    if (!event) return <Error message="Event not found" />;

    return (
        <main>
            <EventPage {...event} isAdmin={isAdmin} />
        </main>
    );
}