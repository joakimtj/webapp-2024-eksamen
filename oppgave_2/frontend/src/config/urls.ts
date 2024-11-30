const baseUrl: String = "http://localhost:3999"

const endpoints = {
    getEvents: `${baseUrl}/api/events`,
    getEvent: `${baseUrl}/api/events`,
    createEvent: `${baseUrl}/api/events`,
    createRegistration: `${baseUrl}/api/registrations`,
    createAttendee: `${baseUrl}/api/attendees`,
}

export { baseUrl, endpoints as endpoints }; 