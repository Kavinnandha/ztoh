'use client';

import React, { useEffect, useState } from 'react';

interface ContactRequest {
    _id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

interface JoinRequest {
    _id: string;
    type: 'student' | 'teacher';
    name: string;
    email: string;
    mobile: string;
    createdAt: string;
    [key: string]: any; // For other dynamic fields
}

export default function AdminRequestsPage() {
    const [activeTab, setActiveTab] = useState<'join' | 'contact'>('join');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | ContactRequest | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/requests?type=${activeTab}`);
                if (res.ok) {
                    const data = await res.json();
                    if (activeTab === 'join') {
                        setJoinRequests(data);
                    } else {
                        setContactRequests(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch requests', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [activeTab]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'join' ? 'Join Requests' : 'Contact Requests'}
                </h1>
                <div className="mt-4 sm:mt-0">
                    <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'join'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Join Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'contact'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Contact Requests
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading requests...</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    {activeTab === 'join' ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {joinRequests.length === 0 ? (
                                <li className="px-6 py-4 text-center text-gray-500">No join requests found.</li>
                            ) : (
                                joinRequests.map((request) => (
                                    <li key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <div className="px-4 py-4 sm:px-6 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-medium text-primary truncate">{request.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.email}</p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.type === 'teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {request.type}
                                                    </span>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(request.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        Mobile: {request.mobile}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {contactRequests.length === 0 ? (
                                <li className="px-6 py-4 text-center text-gray-500">No contact requests found.</li>
                            ) : (
                                contactRequests.map((request) => (
                                    <li key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <div className="px-4 py-4 sm:px-6 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-medium text-primary truncate">{request.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.email}</p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(request.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {request.message}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedRequest(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                            Request Details
                                        </h3>
                                        <div className="mt-4 space-y-3 text-sm text-gray-500 dark:text-gray-300">
                                            {Object.entries(selectedRequest).map(([key, value]) => {
                                                if (key === '_id' || key === '__v' || key === 'updatedAt') return null;
                                                return (
                                                    <div key={key} className="grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                                        <span className="font-semibold capitalize text-gray-700 dark:text-gray-400">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        <span className="col-span-2 break-words">{key === 'createdAt' ? formatDate(value as string) : String(value)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedRequest(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
