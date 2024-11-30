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
