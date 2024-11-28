'use client';

import { EventPage } from "@/components/EventPage";
import { useEvent } from '@/hooks/useEvent';
import React from "react";
import Error from '@/components/loading-states/error';
import Loading from '@/components/loading-states/loading';

type Props = {
    params: {
        eventSlug: string;
    };
};

export default function Page({ params }: Props) {
    const { event, isLoading, error } = useEvent(params.eventSlug);

    if (isLoading) return (
        <Loading />
    );

    if (error) return (
        <Error message={error} />
    );

    return (
        <main>
            <EventPage {...event} />
        </main>
    );
}