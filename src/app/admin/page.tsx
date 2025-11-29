'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Trash2,
    Plus,
    LogOut,
    Key,
    Search,
    Filter,
    X,
    Check,
    Loader2,
    UserPlus,
    MoreVertical,
    Eye
} from 'lucide-react';

interface ContactRequest {
    _id: string;
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    teleCallingStatus: 'pending' | 'called' | 'no_answer' | 'follow_up_needed' | 'converted' | 'not_interested';
    notes: { content: string; createdAt: string }[];
    history: { action: string; details: string; performedBy: string; timestamp: string }[];
    createdAt: string;
}

interface JoinRequest {
    _id: string;
    type: 'student' | 'teacher';
    name: string;
    email: string;
    mobile: string;
    status: 'pending' | 'accepted' | 'declined';
    teleCallingStatus: 'pending' | 'called' | 'no_answer' | 'follow_up_needed' | 'converted' | 'not_interested';
    notes: { content: string; createdAt: string }[];
    history: { action: string; details: string; performedBy: string; timestamp: string }[];
    createdAt: string;
    [key: string]: any;
}

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'join' | 'contact' | 'admins'>('join');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | ContactRequest | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');

    // Search, Sort, Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
    const [filterType, setFilterType] = useState<'all' | 'student' | 'teacher'>('all');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditAdminModal, setShowEditAdminModal] = useState(false);
    const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Form States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
    const [addAdminStatus, setAddAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [addAdminMessage, setAddAdminMessage] = useState('');

    const [editData, setEditData] = useState<any>({});
    const [editStatus, setEditStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [editAdminData, setEditAdminData] = useState({ name: '', email: '', password: '' });
    const [editAdminStatus, setEditAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [deleteAdminStatus, setDeleteAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // New Features State
    const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
    const [sendingEmail, setSendingEmail] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch('/api/admin/me');
                if (res.ok) {
                    const data = await res.json();
                    setAdminEmail(data.email);
                    setIsAuthenticated(true);
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                router.push('/admin/login');
            }
        };
        fetchMe();
    }, [router]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/requests?type=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                if (activeTab === 'join') {
                    setJoinRequests(data);
                } else if (activeTab === 'contact') {
                    setContactRequests(data);
                } else {
                    const adminRes = await fetch('/api/admin/users');
                    if (adminRes.ok) {
                        setAdmins(await adminRes.json());
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchRequests();
    }, [activeTab, isAuthenticated]);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

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
                setConfirmPassword('');
                setTimeout(() => setShowPasswordModal(false), 2000);
            } else {
                setPasswordError(data.error || 'Failed to update password');
            }
        } catch (error) {
            setPasswordError('An error occurred');
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddAdminStatus('loading');
        setAddAdminMessage('');

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin),
            });

            const data = await res.json();

            if (res.ok) {
                setAddAdminStatus('success');
                setAddAdminMessage('Admin added successfully');
                setNewAdmin({ name: '', email: '', password: '' });
                setTimeout(() => {
                    setShowAddAdminModal(false);
                    setAddAdminStatus('idle');
                    setAddAdminMessage('');
                    if (activeTab === 'admins') fetchRequests();
                }, 2000);
            } else {
                setAddAdminStatus('error');
                setAddAdminMessage(data.error || 'Failed to add admin');
            }
        } catch (error) {
            setAddAdminStatus('error');
            setAddAdminMessage('An error occurred');
        }
    };

    const handleEditRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        setEditStatus('loading');

        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTab, ...editData }),
            });

            if (res.ok) {
                setEditStatus('success');
                fetchRequests();
                setTimeout(() => {
                    setShowEditModal(false);
                    setEditStatus('idle');
                }, 1000);
            } else {
                setEditStatus('error');
            }
        } catch (error) {
            setEditStatus('error');
        }
    };

    const handleDeleteRequest = async () => {
        if (!selectedRequest) return;
        setDeleteStatus('loading');

        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}?type=${activeTab}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDeleteStatus('success');
                fetchRequests();
                setTimeout(() => {
                    setShowDeleteModal(false);
                    setSelectedRequest(null);
                    setDeleteStatus('idle');
                }, 1000);
            } else {
                setDeleteStatus('error');
            }
        } catch (error) {
            setDeleteStatus('error');
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setEditAdminStatus('loading');

        try {
            const res = await fetch(`/api/admin/users/${selectedAdmin._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editAdminData),
            });

            if (res.ok) {
                setEditAdminStatus('success');
                fetchRequests();
                setTimeout(() => {
                    setShowEditAdminModal(false);
                    setEditAdminStatus('idle');
                }, 1000);
            } else {
                setEditAdminStatus('error');
            }
        } catch (error) {
            setEditAdminStatus('error');
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;
        setDeleteAdminStatus('loading');

        try {
            const res = await fetch(`/api/admin/users/${selectedAdmin._id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setDeleteAdminStatus('success');
                fetchRequests();
                setTimeout(() => {
                    setShowDeleteAdminModal(false);
                    setSelectedAdmin(null);
                    setDeleteAdminStatus('idle');
                }, 1000);
            } else {
                setDeleteAdminStatus('error');
            }
        } catch (error) {
            setDeleteAdminStatus('error');
        }
    };

    const openEditAdminModal = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setEditAdminData({ name: admin.name, email: admin.email, password: '' });
        setShowEditAdminModal(true);
    };

    const openDeleteAdminModal = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setShowDeleteAdminModal(true);
    };

    const openEditModal = (request: any) => {
        setSelectedRequest(request);
        setEditData({ ...request });
        setShowEditModal(true);
    };

    const openDeleteModal = (request: any) => {
        setSelectedRequest(request);
        setShowDeleteModal(true);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedRequest) return;
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    status: newStatus,
                    history: [...(selectedRequest.history || []), {
                        action: 'Status Update',
                        details: `Status changed to ${newStatus}`,
                        performedBy: 'Admin',
                        timestamp: new Date()
                    }]
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedRequest(updated);
                fetchRequests();
                showToast(`Status updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleUpdateTeleStatus = async (newStatus: string) => {
        if (!selectedRequest) return;
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    teleCallingStatus: newStatus,
                    history: [...(selectedRequest.history || []), {
                        action: 'Tele-calling Update',
                        details: `Tele-calling status changed to ${newStatus}`,
                        performedBy: 'Admin',
                        timestamp: new Date()
                    }]
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedRequest(updated);
                fetchRequests();
                showToast(`Tele-calling status updated to ${newStatus}`, 'success');
            }
        } catch (error) {
            console.error('Failed to update tele-status', error);
            showToast('Failed to update tele-status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest || !noteContent.trim()) return;
        setAddingNote(true);
        try {
            const res = await fetch(`/api/admin/requests/${selectedRequest._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    notes: [...(selectedRequest.notes || []), {
                        content: noteContent,
                        createdAt: new Date()
                    }]
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedRequest(updated);
                setNoteContent('');
                fetchRequests();
                showToast('Note added successfully', 'success');
            }
        } catch (error) {
            console.error('Failed to add note', error);
            showToast('Failed to add note', 'error');
        } finally {
            setAddingNote(false);
        }
    };

    const openEmailModal = () => {
        if (!selectedRequest) return;
        setEmailData({
            to: selectedRequest.email,
            subject: `Regarding your ${activeTab === 'join' ? 'Application' : 'Enquiry'} at Zero To Hero`,
            body: `Dear ${selectedRequest.name},\n\n`
        });
        setShowEmailModal(true);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingEmail(true);
        try {
            const res = await fetch('/api/admin/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.body.replace(/\n/g, '<br>') // Simple conversion
                }),
            });

            if (res.ok) {
                setShowEmailModal(false);
                // Log to history
                if (selectedRequest) {
                    await fetch(`/api/admin/requests/${selectedRequest._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: activeTab,
                            history: [...(selectedRequest.history || []), {
                                action: 'Email Sent',
                                details: `Subject: ${emailData.subject}`,
                                performedBy: 'Admin',
                                timestamp: new Date()
                            }]
                        }),
                    });
                    fetchRequests(); // Refresh to show history
                }
                showToast('Email sent successfully!', 'success');
            } else {
                showToast('Failed to send email.', 'error');
            }
        } catch (error) {
            console.error('Failed to send email', error);
            showToast('An error occurred.', 'error');
        } finally {
            setSendingEmail(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ... (existing handlers)

    const getFilteredAndSortedRequests = () => {
        if (activeTab === 'admins') return admins; // Simple return for now, can add search later
        let requests: any[] = activeTab === 'join' ? joinRequests : contactRequests;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            requests = requests.filter(req =>
                req.name?.toLowerCase().includes(lowerTerm) ||
                req.email?.toLowerCase().includes(lowerTerm) ||
                (req.mobile && req.mobile.includes(lowerTerm))
            );
        }

        if (activeTab === 'join' && filterType !== 'all') {
            requests = requests.filter(req => req.type === filterType);
        }

        if (statusFilter !== 'all') {
            requests = requests.filter(req => (req.status || 'pending') === statusFilter);
        }

        requests.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return requests;
    };

    // Custom Select Component
    const CustomSelect = ({ value, onChange, options, label, disabled }: any) => {
        const [isOpen, setIsOpen] = useState(false);
        const selectedOption = options.find((opt: any) => opt.value === value);

        return (
            <div className="relative min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
                <button
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium flex justify-between items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
                >
                    <span className="capitalize">{selectedOption?.label || value}</span>
                    <Filter size={14} className="text-slate-400" />
                </button>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                            {options.map((option: any) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${value === option.value ? 'text-primary font-semibold bg-primary/5' : 'text-slate-700'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Toast Component
    const Toast = () => {
        if (!toast) return null;
        return (
            <div className={`fixed bottom-4 right-4 z-[60] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
                {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
                <span className="font-medium text-sm">{toast.message}</span>
            </div>
        );
    };

    const displayedRequests = getFilteredAndSortedRequests();

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-8 relative">
            <Toast />
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                {/* ... (existing header content) ... */}
                <div>
                    <h1 className="text-2xl font-bold font-heading text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm">Manage your requests and administrators</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowAddAdminModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                        <UserPlus size={18} />
                        Add Admin
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <Key size={18} />
                        Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs & Controls */}
                <div className="p-6 border-b border-slate-100 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex p-1 bg-slate-100 rounded-xl self-start">
                            <button
                                onClick={() => { setActiveTab('join'); setFilterType('all'); setStatusFilter('all'); }}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'join'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Join Requests
                            </button>
                            <button
                                onClick={() => { setActiveTab('contact'); setStatusFilter('all'); }}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contact'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Contact Requests
                            </button>
                            <button
                                onClick={() => setActiveTab('admins')}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'admins'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Admins
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-64"
                                />
                            </div>

                            {/* Status Filter */}
                            {activeTab !== 'admins' && (
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-white">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="py-2 text-sm bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="declined">Declined</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-white">
                                <Filter size={16} className="text-slate-400" />
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                    className="py-2 text-sm bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer outline-none"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>

                            {activeTab === 'join' && (
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-white">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Type:</span>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as 'all' | 'student' | 'teacher')}
                                        className="py-2 text-sm bg-transparent border-none focus:ring-0 text-slate-700 cursor-pointer outline-none"
                                    >
                                        <option value="all">All</option>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* List */}
                {/* ... (existing list code) ... */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary mb-2" size={32} />
                            <p className="text-slate-500">Loading requests...</p>
                        </div>
                    ) : displayedRequests.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No requests found matching your criteria.
                        </div>
                    ) : activeTab === 'admins' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{admin.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{admin.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(admin.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => openEditAdminModal(admin)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteAdminModal(admin)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    {activeTab === 'join' && <th className="px-6 py-4">Type</th>}
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedRequests.map((request) => (
                                    <tr key={request._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{request.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">{request.email}</div>
                                            {request.mobile && <div className="text-xs text-slate-400 mt-0.5">{request.mobile}</div>}
                                        </td>
                                        {activeTab === 'join' && (
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${request.type === 'teacher'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {request.type}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                request.status === 'declined' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {request.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(request)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            {selectedRequest && !showEditModal && !showDeleteModal && !showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Request Details</h3>
                                <p className="text-sm text-slate-500">Manage status and track history</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Status Actions */}
                                {activeTab !== 'contact' && (
                                    <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <CustomSelect
                                            label="Status"
                                            value={selectedRequest.status || 'pending'}
                                            onChange={handleUpdateStatus}
                                            disabled={updatingStatus}
                                            options={[
                                                { value: 'pending', label: 'Pending' },
                                                { value: 'accepted', label: 'Accepted' },
                                                { value: 'declined', label: 'Declined' }
                                            ]}
                                        />
                                        <CustomSelect
                                            label="Tele-calling Status"
                                            value={selectedRequest.teleCallingStatus || 'pending'}
                                            onChange={handleUpdateTeleStatus}
                                            disabled={updatingStatus}
                                            options={[
                                                { value: 'pending', label: 'Pending' },
                                                { value: 'called', label: 'Called' },
                                                { value: 'no_answer', label: 'No Answer' },
                                                { value: 'follow_up_needed', label: 'Follow Up Needed' },
                                                { value: 'converted', label: 'Converted' },
                                                { value: 'not_interested', label: 'Not Interested' }
                                            ]}
                                        />
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={openEmailModal}
                                        className="flex-1 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                        Send Email
                                    </button>
                                </div>

                                {/* Data Fields */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900">Information</h4>
                                    {Object.entries(selectedRequest).map(([key, value]) => {
                                        if (['_id', '__v', 'updatedAt', 'status', 'teleCallingStatus', 'notes', 'history'].includes(key)) return null;
                                        return (
                                            <div key={key} className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-50 last:border-0">
                                                <span className="text-sm font-semibold text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <span className="col-span-2 text-sm text-slate-900 break-words font-medium">
                                                    {key === 'createdAt' ? formatDate(value as string) : String(value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Column: Notes & History */}
                            <div className="space-y-8">
                                {/* Notes */}
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-4">Notes</h4>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-60 overflow-y-auto mb-4 space-y-3">
                                        {selectedRequest.notes?.length ? (
                                            selectedRequest.notes.map((note, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                    <p className="text-sm text-slate-700 mb-1">{note.content}</p>
                                                    <p className="text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400 text-center py-4">No notes yet.</p>
                                        )}
                                    </div>
                                    <form onSubmit={handleAddNote} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Add a note..."
                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={addingNote || !noteContent.trim()}
                                            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </form>
                                </div>

                                {/* History */}
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-4">History</h4>
                                    <div className="relative border-l-2 border-slate-100 ml-2 space-y-6">
                                        {selectedRequest.history?.slice().reverse().map((event, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                                <p className="text-sm font-semibold text-slate-900">{event.action}</p>
                                                <p className="text-xs text-slate-500 mb-1">{event.details}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                    {formatDate(event.timestamp)} • {event.performedBy}
                                                </p>
                                            </div>
                                        ))}
                                        {!selectedRequest.history?.length && (
                                            <p className="text-sm text-slate-400 pl-6">No history available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Send Email</h3>
                            <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                                <input
                                    type="email"
                                    value={emailData.to}
                                    disabled
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    value={emailData.body}
                                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEmailModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    {sendingEmail && <Loader2 className="animate-spin" size={16} />}
                                    Send Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit Request</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleEditRequest} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editData.name || ''}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            {/* Add more fields as needed, keeping it simple for now */}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editStatus === 'loading'}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    {editStatus === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Request?</h3>
                        <p className="text-slate-500 mb-8">
                            Are you sure you want to delete this request from <span className="font-semibold text-slate-900">{selectedRequest.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRequest}
                                disabled={deleteStatus === 'loading'}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                {deleteStatus === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Add New Admin</h3>
                            <button onClick={() => setShowAddAdminModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>


                            {addAdminMessage && (
                                <div className={`text-sm text-center p-2 rounded-lg ${addAdminStatus === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {addAdminMessage}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAdminModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addAdminStatus === 'loading'}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    {addAdminStatus === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                    Add Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            {passwordError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">{passwordError}</div>}
                            {passwordSuccess && <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg text-center">{passwordSuccess}</div>}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {showEditAdminModal && selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900">Edit Admin</h3>
                            <button onClick={() => setShowEditAdminModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleEditAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editAdminData.name}
                                    onChange={(e) => setEditAdminData({ ...editAdminData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editAdminData.email}
                                    onChange={(e) => setEditAdminData({ ...editAdminData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current"
                                    value={editAdminData.password}
                                    onChange={(e) => setEditAdminData({ ...editAdminData, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditAdminModal(false)}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editAdminStatus === 'loading'}
                                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    {editAdminStatus === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Admin Modal */}
            {showDeleteAdminModal && selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Admin?</h3>
                        <p className="text-slate-500 mb-8">
                            Are you sure you want to delete admin <span className="font-semibold text-slate-900">{selectedAdmin.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeleteAdminModal(false)}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAdmin}
                                disabled={deleteAdminStatus === 'loading'}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                {deleteAdminStatus === 'loading' && <Loader2 className="animate-spin" size={16} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
