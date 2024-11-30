# Event Management System Technical Documentation

## 1. API Endpoints (Resources)

### Events
- Base path: `/api/events`

| Verb   | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| GET    | /api/events      | List all events (with filtering) |
| GET    | /api/events/{id} | Get specific event               |
| POST   | /api/events      | Create new event                 |
| PUT    | /api/events/{id} | Update event                     |
| DELETE | /api/events/{id} | Delete event                     |

### Templates
- Base path: `/api/templates`

| Verb   | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| GET    | /api/templates      | List all templates    |
| GET    | /api/templates/{id} | Get specific template |
| POST   | /api/templates      | Create new template   |
| PUT    | /api/templates/{id} | Update template       |
| DELETE | /api/templates/{id} | Delete template       |

### Registrations
- Base path: `/api/registrations`

| Verb   | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| GET    | /api/registrations      | List all registrations     |
| GET    | /api/registrations/{id} | Get specific registration  |
| POST   | /api/registrations      | Create new registration    |
| PUT    | /api/registrations/{id} | Update registration status |
| DELETE | /api/registrations/{id} | Delete registration        |

### Statistics
- Base path: `/api/statistics`

| Verb | Endpoint                 | Description             |
| ---- | ------------------------ | ----------------------- |
| GET  | /api/statistics/overview | Get overview statistics |
| GET  | /api/statistics/export   | Export data to Excel    |

## 2. API Request/Response Specifications

### Events

#### GET /api/events
Query Parameters:
- `month`: number (1-12)
- `year`: number
- `type`: string
- `status`: string (available/full)
- `page`: number
- `limit`: number

Success Response (200):
```json
{
  "data": [{
    "id": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "eventType": "string",
    "date": "string",
    "location": "string",
    "capacity": number,
    "registered": number,
    "price": number,
    "status": "string",
    "isPrivate": boolean,
    "templateId": "string|null",
  }]
}
```

Error Responses:
- 400: Invalid query parameters
- 500: Server error

[Similar response structures documented for other endpoints...]

## 3. Frontend Routes and Pages

### Public Pages
1. `/events` (Event Listing)
   - List all public events
   - Filter events
   - Navigate to event details
   
2. `/events/:slug` (Event Details)
   - View event details
   - Register for event
   - See availability status

### Admin Pages
1. `/admin/events`
   - CRUD operations for events
   - Filter and search events
   - Access templates
   
2. `/admin/templates`
   - Create/edit templates
   - View template usage
   
3. `/admin/registrations`
   - Manage registrations
   - Approve/reject registrations
   
4. `/admin/statistics`
   - View statistics
   - Export data

## 4. Filtering Implementation

### Frontend
1. URL Query Parameters:
   ```typescript
   interface EventFilters {
    month?: number;
    year?: number;
    event_type?: string;
    status?: 'available' | 'full';
    }
   ```

2. Filter Component:
   - Updates URL with selected filters
   - Triggers API call on filter change
   - Maintains filter state

### Backend
1. Query Building:
```typescript
interface EventQuery {
  where: {
    AND?: Array<{
      date?: { gte: Date, lte: Date };
      eventType?: string;
      capacity?: { gt: registered };
    }>;
  };
  orderBy: { date: 'asc' };
}
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

