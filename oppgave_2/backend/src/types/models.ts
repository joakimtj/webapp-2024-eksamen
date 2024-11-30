export interface Template {
    id: string;
    name: string;
    event_type: string;
    default_capacity: number;
    default_price: number;
    rules: string;
    created_at: string;
    updated_at: string;
}

export interface CreateTemplateData {
    name: string;
    event_type: string;
    default_capacity: number;
    default_price: number;
    rules: string;
}

/*** Events ***/

export interface Event {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    event_type: string;
    date: string;
    location: string;
    capacity: number;
    price: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateEventData {
    title: string;
    slug: string;
    description: string | null;
    event_type: string;
    date: string;
    location: string;
    capacity: number;
    price: number | null;
}

export interface UpdateEventData {
    title?: string;
    description?: string;
    event_type?: string;
    date?: string;
    location?: string;
    capacity?: number;
    price?: number;
}

export interface EventFilters {
    month?: number;
    year?: number;
    event_type?: string;
    status?: 'available' | 'full';
}

export interface FilterOptions {
    event_types: string[];
    years: number[];
    months: number[];
}

/*** Registration ***/

export interface Registration {
    id: string;
    event_id: string;
    status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
}

export interface CreateRegistrationData {
    event_id: string;
    status: string;
    total_price: number;
}

/*** Attendee ***/

export interface Attendee {
    id: string;
    registration_id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
}

export interface CreateAttendeeData {
    registration_id: string;
    name: string;
    email: string;
    phone: string;
}
