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