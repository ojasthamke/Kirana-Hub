'use client';

import { useState, useEffect } from 'react';
import {
    Users, ShoppingBag, Box, TrendingUp, ShieldCheck,
    Settings, UserPlus, AlertCircle, CheckCircle, Clock
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'orders' | 'payments'>('overview');
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/vendors')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setVendors(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleVendorStatus = async (vendorId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'approved' ? 'blocked' : 'approved';
        const res = await fetch('/api/admin/vendors', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendorId, status: newStatus })
        });
        if (res.ok) {
            setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, status: newStatus } : v));
        }
    };

    if (loading) return <div className="container py-20 text-center">Loading Portal...</div>;

    return (
        <div className="container py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Admin Portal</h1>
                <p className="text-secondary text-sm">System oversight, vendor approvals and financial control.</p>
            </div>

            <div className="flex bg-surface-color p-1 rounded-lg mb-8 gap-1 w-fit border border-border-color overflow-x-auto max-w-full">
                {[
                    { id: 'overview', icon: <Box size={18} />, label: 'Overview' },
                    { id: 'vendors', icon: <Users size={18} />, label: 'Vendors' },
                    { id: 'orders', icon: <ShoppingBag size={18} />, label: 'Master Orders' },
                    { id: 'payments', icon: <TrendingUp size={18} />, label: 'Payments' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`btn py-2 px-6 text-sm flex items-center gap-2 flex-shrink-0 ${activeTab === tab.id ? 'btn-primary bg-white !text-black shadow-sm' : 'hover:opacity-70'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card p-6 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-surface-color text-accent-color"><Users /></div>
                            <div className="text-sm text-secondary font-medium">Total Vendors</div>
                            <div className="text-2xl font-bold mt-1">{vendors.length}</div>
                        </div>
                        {/* More Admin stats can go here... */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-6">Pending Vendor Approvals</h3>
                            <div className="space-y-4">
                                {vendors.filter(v => v.status === 'pending').map((req, i) => (
                                    <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-border-color rounded-md gap-4">
                                        <div>
                                            <div className="text-sm font-bold">{req.store_name}</div>
                                            <div className="text-xs text-secondary">{req.name} • Turnover: {req.turnover}</div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button className="btn btn-primary text-xs py-1 px-4 flex-1" onClick={() => toggleVendorStatus(req._id, 'pending')}>Approve</button>
                                        </div>
                                    </div>
                                ))}
                                {vendors.filter(v => v.status === 'pending').length === 0 && <p className="text-sm text-secondary">No pending requests.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'vendors' && (
                <div className="card p-6 border-none shadow-sm animate-fade-in overflow-x-auto">
                    <h3 className="text-xl font-bold mb-6">Vendor Management</h3>
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="border-b border-border-color">
                            <tr className="text-left text-secondary uppercase text-xs font-bold">
                                <th className="py-4">Store Name</th>
                                <th className="py-4">GST NO</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map((v) => (
                                <tr key={v._id} className="border-b border-border-color hover:bg-surface-color">
                                    <td className="py-4 font-bold">{v.store_name}</td>
                                    <td className="py-4">{v.gst_number}</td>
                                    <td className="py-4">
                                        <span className={`badge ${v.status === 'approved' ? 'badge-success' : v.status === 'blocked' ? 'badge-error' : 'badge-warning'}`}>{v.status}</span>
                                    </td>
                                    <td className="py-4">
                                        <button className="btn btn-outline text-xs px-4 py-1" onClick={() => toggleVendorStatus(v._id, v.status)}>
                                            {v.status === 'approved' ? 'Block' : 'Approve'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
