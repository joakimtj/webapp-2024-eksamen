# Implementations

Just in case, some functionality isn't obvious, we've decided to list some of the more important ones out here.

## Events

### Event Deletion

When an event is deleted, its registrations and their attendees will be deleted.

### Private Events

'User' will not see in the frontend, or get from the backend, events that are private. (isPublic = false/0)
E.g., a user will nto be able to see private events in their network response.
But 'user' will be able to access the event through the stub.

## Registrations and Attendees

Registrations and its listed attendees is exposed to the admin on an event's landing page. (EventPage)

### Approved registrations and spots counter

On the homepage (EventListing component) there is a 'spots left' counter. The data is fetched from the server by
checking the attendees of the event whose registration has been set to 'approved'.

### Pending registrations

The admin can set a registrations status as approved or rejected from pending in a drop-down.

### Delete Registrations

An admin can choose to delete registrations. Deleting a registration will delete its associated attendees.

## Template Rules

### No Same Day
Create an event with a template using this rule.
Then attempt to create another event on the same day (it has to have a different title bcuz fo slug generation).
The backend will respond that it could not create the event because of the rule.

### Fixed Price and Fixed Capacity
As admin, if you click the edit icon on an event's landing page, you will not be able to edit its price or capacity with these rules active. 
A template with these rules, will also not have these options exposed to them in the dropdown form for event creation on a template.

### Is Private Rule
If an event was created by a template with this as a rule, then an admin is NOT able to edit its visibility on the EventPage (an event's landing page.)
E.g., admin cannot edit isPublic to be true on the event page. That toggle cannot be interacted with.

### Cannot Delete Template with active Event
If you attempt to delete a template that was made from a specific template, the deletion will fail with a message.

### Allowed WeekDays
A template can be set to only allow events created on specific days.
When set, this will be enforced both in the backend and frontend.
E.g., the event landing page will rely on the backend enforcement by sending an alert error informing admin of the rule enforcement.
On the CreateEventForm (the template dropdown event creation on the manage templates screen) this is additionally enforced on the frontend.