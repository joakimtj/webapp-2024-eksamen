//TODO: Update backend to use isPublic, template_id on Event model

// Event Types
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
    isPublic?: boolean;
    template_id: string | null;
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
    isPublic?: boolean;
    template_id: string | null;
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
    isPublic?: boolean;
    template_id?: string;
    isAdmin?: boolean;  // Change from required to optional
}

export interface FilterOptions {
    event_types: string[];
    years: number[];
    months: number[];
}

// Template Types
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

export interface TemplateRules {
    noSameDayEvents?: boolean;        // Rule 1
    allowedWeekDays?: number[];       // Rule 2 (0-6, where 0 is Sunday)
    isPrivate?: boolean;              // Rule 3
    hasFixedCapacity?: boolean;       // Rule 4
    fixedCapacity?: number;           // Rule 4
    hasFixedPrice?: boolean;          // Rule 5
    fixedPrice?: number;              // Rule 5
    isFree?: boolean;                 // Rule 6
    hasWaitingList?: boolean;         // Rule 7
}

// Registration Types
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

export interface UpdateRegistrationData {
    status?: string;
    total_price?: number;
}

// Attendee Types
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