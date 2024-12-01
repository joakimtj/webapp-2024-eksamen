# Implementations

Some functionality might not be obvious so here we explain some of it.

## Events

### Event Deletion

When an event is deleted, its registrations and their attendees will be deleted.

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

### Cannot Delete Template with active Event
If you attempt to delete a template that was made from a specific template, the deletion will fail with a message.