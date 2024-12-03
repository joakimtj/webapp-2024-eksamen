# Event Management System Technical Documentation

## 1. API Endpoints (Resources)

### Events
- Base path: `/api/events`

| Verb   | Endpoint                      | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| GET    | /api/events                   | List all events (with filtering) |
| GET    | /api/events/filters           | Get filter options               |
| GET    | /api/events/:slug             | Get specific event by slug       |
| GET    | /api/events/capacity/:eventId | Get event capacity info          |
| POST   | /api/events                   | Create new event                 |
| PUT    | /api/events/:id               | Replace event                    |
| PATCH  | /api/events/:id               | Update event                     |
| DELETE | /api/events/:id               | Delete event                     |

### Templates
- Base path: `/api/templates`

| Verb   | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | /api/templates     | List all templates    |
| GET    | /api/templates/:id | Get specific template |
| POST   | /api/templates     | Create new template   |
| PUT    | /api/templates/:id | Update template       |
| DELETE | /api/templates/:id | Delete template       |

### Registrations
- Base path: `/api/registrations`

| Verb   | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | /api/registrations                | List all registrations     |
| GET    | /api/registrations/:id            | Get specific registration  |
| GET    | /api/registrations/event/:eventId | Get event's registrations  |
| POST   | /api/registrations                | Create new registration    |
| PUT    | /api/registrations/:id            | Update registration        |
| PATCH  | /api/registrations/:id            | Update registration status |
| DELETE | /api/registrations/:id            | Delete registration        |

### Attendees
- Base path: `/api/attendees`

| Verb   | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| GET    | /api/attendees                     | List all attendees         |
| GET    | /api/attendees/:id                 | Get specific attendee      |
| GET    | /api/attendees/registration/:regId | Get registration attendees |
| POST   | /api/attendees                     | Create new attendee        |
| PUT    | /api/attendees/:id                 | Update attendee            |
| DELETE | /api/attendees/:id                 | Delete attendee            |

### Statistics
- Base path: `/api/statistics`

| Verb | Endpoint                 | Description             |
| ---- | ------------------------ | ----------------------- |
| GET  | /api/statistics/overview | Get overview statistics |
| GET  | /api/statistics/export   | Export data to Excel    |

## 2. API Request/Response Specifications

All responses follow the Result type pattern:

### Events

## 2. API Request/Response Specifications

All responses follow the Result type pattern:
```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

### Events

#### GET /api/events
Query Parameters:
- `month`: number (1-12)
- `year`: number
- `event_type`: string
- `isAdmin`: boolean

Success Response (200):
```json
{
  "success": true,
  "data": [{
    "id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "event_type": "string",
    "date": "string",
    "location": "string",
    "capacity": number,
    "price": number,
    "is_private": boolean,
    "template_id": "string|null"
  }]
}
```

#### GET /api/events/filters
Success Response (200):
```json
{
  "success": true,
  "data": {
    "event_types": string[],
    "months": number[],
    "years": number[]
  }
}
```

#### GET /api/events/capacity/:eventId
Success Response (200):
```json
{
  "success": true,
  "data": {
    "spotsLeft": number
  }
}
```

#### POST /api/events
Request Body:
```json
{
  "title": "string",
  "event_type": "string",
  "date": "string",
  "location": "string",
  "capacity": number,
  "price": number,
  "slug": "string?",
  "description": "string?",
  "is_private": boolean?,
  "template_id": "string?"
}
```

Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    // ...same as event object above
  }
}
```

Error Responses:
- 400: Invalid input / Duplicate slug
- 500: Server error

### Templates

#### GET /api/templates/:id
Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "event_type": "string",
    "default_capacity": number,
    "default_price": number,
    "rules": "string"
  }
}
```

#### POST /api/templates
Request Body:
```json
{
  "name": "string",
  "event_type": "string",
  "default_capacity": number,
  "default_price": number,
  "rules": "string"
}
```

### Registrations

#### GET /api/registrations/event/:eventId
Success Response (200):
```json
{
  "success": true,
  "data": [{
    "id": "string",
    "event_id": "string",
    "status": "pending" | "approved" | "rejected",
    "total_price": number
  }]
}
```

#### PATCH /api/registrations/:id
Request Body:
```json
{
  "status": "pending" | "approved" | "rejected",
  "total_price": number
}
```

### Attendees

#### GET /api/attendees/registration/:registrationId
Success Response (200):
```json
{
  "success": true,
  "data": [{
    "id": "string",
    "registration_id": "string",
    "name": "string",
    "email": "string",
    "phone": "string"
  }]
}
```

#### POST /api/attendees
Request Body:
```json
{
  "registration_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

### Common Error Responses

All endpoints may return these error responses:

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Description of what's wrong"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource type not found"
  }
}
```

#### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## 3. Frontend Routes and Pages

### Public
1. `/events` (Event Listing)
   - List all public events
   - Filter events
   - Navigate to event details
   
2. `/events/:slug` (Event Details)
   - View event details
   - Register for event
   - See availability status

### Admin
1. `/events`
   - Expose admin-specific features
   - Filter events
2. `/events/:slug` (Event Details)
   - View event details
   - Edit event details
   - Register for event
   - See availability status
   - View registrations and attendees
   - Approve, reject og delete registrations
3. `/templates`
   - Create/edit/delete templates
   - Create events

## 4. Filtering Implementation

### Frontend
1. URL Query Parameters and Filter Interface:
   ```typescript
   interface EventFilters {
     month?: number;
     year?: number;
     event_type?: string;
     status?: 'available' | 'full';
     isPublic?: boolean;
     template_id?: string;
     isAdmin?: boolean;
   }
   ```

2. Filter Options Interface:
   ```typescript
   interface FilterOptions {
     event_types: string[];
     years: number[];
     months: number[];
   }
   ```

### Backend
1. Database Query Implementation:
   - Builds a dynamic SQL query based on provided filters
   - Uses parameterized queries for security
   - Handles admin vs public event visibility
   - Returns filtered events ordered by date

Example query construction:
```typescript
let query = 'SELECT * FROM events';
const params: any[] = [];
const conditions: string[] = [];

if (filters) {
    if (filters.isAdmin === false) {
        conditions.push('isPublic = 1');
    }

    if (filters.month) {
        conditions.push("strftime('%m', date) = ?");
        params.push(filters.month.toString().padStart(2, '0'));
    }

    if (filters.year) {
        conditions.push("strftime('%Y', date) = ?");
        params.push(filters.year.toString());
    }

    if (filters.event_type) {
        conditions.push('event_type = ?');
        params.push(filters.event_type);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
}

query += ' ORDER BY date';
```
## 5. Data Models

### Core Models

```typescript
interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventType: string;
  date: Date;
  location: string;
  capacity: number;
  price: number | null;
  isPrivate: boolean;
  templateId: string | null;
  rules: EventRules;
  createdAt: Date;
  updatedAt: Date;
}

interface Template {
  id: string;
  name: string;
  eventType: string;
  defaultCapacity: number;
  defaultPrice: number | null;
  rules: TemplateRules;
  events: Event[];
  createdAt: Date;
  updatedAt: Date;
}

interface Registration {
  id: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees: Attendee[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Attendee {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
}
```

## 6. Template System Implementation

1. Template Creation:
   - Store template with rules
   - Validate rule combinations
   
2. Event Creation from Template:
```typescript
async function createEventFromTemplate(
  templateId: string,
  overrides: Partial<Event>
): Promise<Event> {
  const template = await getTemplate(templateId);
  
  // Validate template rules
  await validateTemplateRules(template, overrides);
  
  // Merge template with overrides
  const event = {
    ...template,
    ...overrides,
    templateId: template.id,
    id: generateId(),
    slug: generateSlug(overrides.title || template.title)
  };
  
  return saveEvent(event);
}
```

## 7. Database Schema

```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  default_capacity INTEGER,
  default_price DECIMAL(10,2),
  rules TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10,2),
  isPublic BOOLEAN DEFAULT true,
  template_id TEXT REFERENCES templates(id),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id),
  status TEXT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE attendees (
  id TEXT PRIMARY KEY,
  registration_id TEXT REFERENCES registrations(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

## 8. Key Relationships

1. Template -> Events (1:Many)
   - A template can be used by multiple events
   - Events reference their source template
   
2. Event -> Registrations (1:Many)
   - An event can have multiple registrations
   - Registrations belong to one event

3. Registration -> Attendees (1:Many)
   - A registration can include multiple attendees
   - Attendees belong to one registration

