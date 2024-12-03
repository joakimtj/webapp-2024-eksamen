const baseUrl: String = "http://localhost:3999"

// These endpoints are defined in a very silly way but I'm sticking to them lol
// Just know, that I am aware that this shit sucks lol

const endpoints = {
    getEvents: `${baseUrl}/api/events`,
    getEvent: `${baseUrl}/api/events`,
    getTemplates: `${baseUrl}/api/templates`,
    getRegistrations: `${baseUrl}/api/registrations`,
    getAttendees: `${baseUrl}/api/attendees`,
    createEvent: `${baseUrl}/api/events`,
    createRegistration: `${baseUrl}/api/registrations`,
    createAttendee: `${baseUrl}/api/attendees`,
    createTemplate: `${baseUrl}/api/templates`,
}

export { baseUrl, endpoints as endpoints }; 