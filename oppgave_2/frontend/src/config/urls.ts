const baseUrl: String = "http://localhost:3999"

const endpoints = {
    getEvents: `${baseUrl}/api/events`,
    getEvent: `${baseUrl}/api/events`,
    getTemplates: `${baseUrl}/api/templates`,
    createEvent: `${baseUrl}/api/events`,
    createRegistration: `${baseUrl}/api/registrations`,
    createAttendee: `${baseUrl}/api/attendees`,
    createTemplate: `${baseUrl}/api/templates`,
}

export { baseUrl, endpoints as endpoints }; 