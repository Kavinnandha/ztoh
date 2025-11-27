'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    [key: string]: any;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'join' | 'contact'>('join');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | ContactRequest | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');

    // Search, Sort, Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [filterType, setFilterType] = useState<'all' | 'student' | 'teacher'>('all');

    // Change Password Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        const checkAuth = () => {
            const loggedIn = localStorage.getItem('adminLoggedIn');
            if (!loggedIn) {
                router.push('/admin/login');
            } else {
                setIsAuthenticated(true);
                // In a real app, you'd decode the token to get the email
                // For now, we'll assume the admin is the one we set up
                setAdminEmail('admin@ztoh.com');
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated) return;

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
    }, [activeTab, isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        router.push('/admin/login');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: adminEmail, currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordSuccess('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setTimeout(() => setShowPasswordModal(false), 2000);
            } else {
                setPasswordError(data.error || 'Failed to update password');
            }
        } catch (error) {
            setPasswordError('An error occurred');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Filter and Sort Logic
    const getFilteredAndSortedRequests = () => {
        let requests: any[] = activeTab === 'join' ? joinRequests : contactRequests;

        // Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            requests = requests.filter(req =>
                req.name.toLowerCase().includes(lowerTerm) ||
                req.email.toLowerCase().includes(lowerTerm) ||
                (req.mobile && req.mobile.includes(lowerTerm))
            );
        }

        // Filter by Type (only for Join Requests)
        if (activeTab === 'join' && filterType !== 'all') {
            requests = requests.filter(req => req.type === filterType);
        }

        // Sort
        requests.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return requests;
    };

    const displayedRequests = getFilteredAndSortedRequests();

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Tabs and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
                    <button
                        onClick={() => { setActiveTab('join'); setFilterType('all'); }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'join'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Join Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'contact'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Contact Requests
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48"
                    />

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                    {activeTab === 'join' && (
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as 'all' | 'student' | 'teacher')}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">All Types</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Requests List */}
            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading requests...</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {displayedRequests.length === 0 ? (
                            <li className="px-6 py-4 text-center text-gray-500">No requests found.</li>
                        ) : (
                            displayedRequests.map((request) => (
                                <li key={request._id} className="hover:bg-gray-50 transition-colors">
                                    <div className="px-4 py-4 sm:px-6 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-medium text-primary truncate">{request.name}</p>
                                                <p className="text-sm text-gray-500">{request.email}</p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                                                {activeTab === 'join' && (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.type === 'teacher' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {request.type}
                                                    </span>
                                                )}
                                                <p className="mt-1 text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                {activeTab === 'join' ? (
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Mobile: {request.mobile}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-500 line-clamp-1">
                                                        {request.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedRequest(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Request Details
                                        </h3>
                                        <div className="mt-4 space-y-3 text-sm text-gray-500">
                                            {Object.entries(selectedRequest).map(([key, value]) => {
                                                if (key === '_id' || key === '__v' || key === 'updatedAt') return null;
                                                return (
                                                    <div key={key} className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-2">
                                                        <span className="font-semibold capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        <span className="col-span-2 break-words">{key === 'createdAt' ? formatDate(value as string) : String(value)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowPasswordModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Change Password</h3>
                                <form onSubmit={handleChangePassword}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
                                    {passwordSuccess && <p className="mt-2 text-sm text-green-600">{passwordSuccess}</p>}
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:col-start-2 sm:text-sm"
                                        >
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:col-start-1 sm:text-sm"
                                            onClick={() => setShowPasswordModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
