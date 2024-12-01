export type Success<T> = {
    success: true;
    data: T;
};

export type Failure = {
    success: false;
    error: {
        code: string;
        message: string;
    };
};

export type Result<T> = Success<T> | Failure;

export interface Registration {
    id: string;
    event_id: string;
    status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
}

export interface Attendee {
    id: string;
    registration_id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
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