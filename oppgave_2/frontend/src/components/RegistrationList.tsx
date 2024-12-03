import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { endpoints } from '@/config/urls';
import { Attendee, Registration } from '@/types';

interface RegistrationListProps {
    eventId: string;
}

interface UpdateStatusError {
    registrationId: string;
    message: string;
}

const RegistrationList: React.FC<RegistrationListProps> = ({ eventId }) => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [attendeesByRegistration, setAttendeesByRegistration] = useState<Record<string, Attendee[]>>({});
    const [expandedRegistrationId, setExpandedRegistrationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatuses, setUpdatingStatuses] = useState<string[]>([]);
    const [deletingRegistrations, setDeletingRegistrations] = useState<string[]>([]);
    const [statusError, setStatusError] = useState<UpdateStatusError | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, [eventId]);

    const fetchRegistrations = async () => {
        try {
            const response = await fetch(`${endpoints.getRegistrations}/event/${eventId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error.message);
            if (result.success) {
                setRegistrations(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendees = async (registrationId: string) => {
        if (attendeesByRegistration[registrationId]) return;

        try {
            const response = await fetch(`${endpoints.getAttendees}/registration/${registrationId}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error.message);
            if (result.success) {
                setAttendeesByRegistration(prev => ({
                    ...prev,
                    [registrationId]: result.data
                }));
            }
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
        }
    };

    const handleToggleRegistration = async (registrationId: string) => {
        if (expandedRegistrationId === registrationId) {
            setExpandedRegistrationId(null);
        } else {
            setExpandedRegistrationId(registrationId);
            await fetchAttendees(registrationId);
        }
    };

    const handleStatusChange = async (registrationId: string, newStatus: string) => {
        setUpdatingStatuses(prev => [...prev, registrationId]);
        setStatusError(null);

        try {
            const response = await fetch(`${endpoints.getRegistrations}/${registrationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to update status');
            }

            if (result.success) {
                setRegistrations(prev =>
                    prev.map(reg => reg.id === registrationId ? result.data : reg)
                );
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            setStatusError({
                registrationId,
                message: error instanceof Error ? error.message : 'Failed to update status'
            });
            // Revert the select to the previous status
            const currentRegistration = registrations.find(r => r.id === registrationId);
            if (currentRegistration) {
                const select = document.querySelector(`select[data-registration-id="${registrationId}"]`) as HTMLSelectElement;
                if (select) select.value = currentRegistration.status;
            }
        } finally {
            setUpdatingStatuses(prev => prev.filter(id => id !== registrationId));
        }
    };

    const handleDeleteRegistration = async (registrationId: string) => {
        if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
            return;
        }

        setDeletingRegistrations(prev => [...prev, registrationId]);

        try {
            const response = await fetch(`${endpoints.getRegistrations}/${registrationId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to delete registration');
            }

            if (result.success) {
                setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
                setAttendeesByRegistration(prev => {
                    const newState = { ...prev };
                    delete newState[registrationId];
                    return newState;
                });
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Failed to delete registration:', error);
            alert('Failed to delete registration: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setDeletingRegistrations(prev => prev.filter(id => id !== registrationId));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        );
    }

    if (registrations.length === 0) {
        return <div className="text-center py-6 text-gray-500">No registrations yet</div>;
    }

    return (
        <div className="space-y-4">
            {statusError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4">
                    {statusError.message}
                </div>
            )}

            {registrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div
                        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                        onClick={() => handleToggleRegistration(registration.id)}
                    >
                        <div className="flex items-center gap-4">
                            {expandedRegistrationId === registration.id ?
                                <ChevronUp className="w-5 h-5" /> :
                                <ChevronDown className="w-5 h-5" />
                            }
                            <div>
                                <div className="font-medium">Registration #{registration.id.slice(-6)}</div>
                                <div className="text-sm text-gray-500">
                                    Total: {registration.total_price} NOK
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {updatingStatuses.includes(registration.id) && (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                            <select
                                value={registration.status}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(registration.id, e.target.value);
                                }}
                                onClick={e => e.stopPropagation()}
                                data-registration-id={registration.id}
                                disabled={updatingStatuses.includes(registration.id)}
                                className={`px-3 py-1 rounded border ${registration.status === 'approved' ? 'text-green-600 border-green-200 bg-green-50' :
                                    registration.status === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' :
                                        'text-yellow-600 border-yellow-200 bg-yellow-50'
                                    } ${updatingStatuses.includes(registration.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRegistration(registration.id);
                                }}
                                disabled={deletingRegistrations.includes(registration.id)}
                                className={`p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50
                  ${deletingRegistrations.includes(registration.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {deletingRegistrations.includes(registration.id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {expandedRegistrationId === registration.id && (
                        <div className="p-4 border-t bg-gray-50">
                            <h4 className="font-medium mb-3">Attendees</h4>
                            <div className="space-y-3">
                                {attendeesByRegistration[registration.id]?.map((attendee) => (
                                    <div key={attendee.id} className="bg-white p-3 rounded border">
                                        <div className="font-medium">{attendee.name}</div>
                                        <div className="text-sm text-gray-500">{attendee.email}</div>
                                        <div className="text-sm text-gray-500">{attendee.phone}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default RegistrationList;