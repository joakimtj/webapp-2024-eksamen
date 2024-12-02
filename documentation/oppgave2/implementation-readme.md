# Implementations

Some functionality might not be obvious so here we explain some of it.

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
If an event was created by a template with the is private rule, then an admin cannot edit it to public on the events page.

### Cannot Delete Template with active Event
If you attempt to delete a template that was made from a specific template, the deletion will fail with a message.