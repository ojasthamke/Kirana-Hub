'use client';

import { useState, useEffect } from 'react';
import {
    Plus, LayoutDashboard, ShoppingBag, Box, TrendingUp, CreditCard,
    CheckCircle, Clock, Truck, FileText, Download, XCircle, Search
} from 'lucide-react';
import { generateInvoice } from '@/lib/invoice';
import { exportToExcel } from '@/lib/excel';

export default function VendorDashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'stats'>('dashboard');
    const [orders, setOrders] = useState<any[]>([]);
    const [wallet, setWallet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordRes, walRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/vendor/wallet')
                ]);
                const ordData = await ordRes.json();
                const walData = await walRes.json();
                if (Array.isArray(ordData)) setOrders(ordData);
                if (walData) setWallet(walData);
            } catch (e) { } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        const res = await fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        }
    };

    const handleInvoice = (order: any) => {
        generateInvoice(order, { store_name: 'Your Store', store_address: 'Main Market', gst_number: '27AAAAA0000A1Z5' });
    };

    if (loading) return <div className="container py-20 text-center">Loading Dashboard...</div>;

    return (
        <div className="container py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Vendor Panel</h1>
                    <p className="text-secondary text-sm">Manage your store operations and finances.</p>
                </div>
                <div className="card shadow-md flex items-center gap-4 bg-white px-6 py-3 border-l-4 border-l-warning-color mt-4 md:mt-0">
                    <div>
                        <div className="text-xs text-secondary font-semibold uppercase tracking-wider">Pending Payment</div>
                        <div className="text-xl font-bold text-warning-color">₹{wallet?.pending_amount || 0}</div>
                    </div>
                    <button className="btn btn-primary text-xs py-2 px-3">Mark Paid</button>
                </div>
            </div>

            <div className="flex bg-surface-color p-1 rounded-lg mb-8 gap-1 w-fit border border-border-color overflow-x-auto max-w-full">
                {[
                    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
                    { id: 'orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
                    { id: 'products', icon: <Box size={18} />, label: 'Products' },
                    { id: 'stats', icon: <TrendingUp size={18} />, label: 'Finances' }
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

            {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card p-6 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-surface-color text-accent-color"><ShoppingBag /></div>
                            <div className="text-sm text-secondary font-medium">Total Orders</div>
                            <div className="text-2xl font-bold mt-1">{wallet?.total_orders || 0}</div>
                        </div>
                        <div className="card p-6 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-surface-color text-success-color"><CheckCircle /></div>
                            <div className="text-sm text-secondary font-medium">Delivered</div>
                            <div className="text-2xl font-bold mt-1">{wallet?.total_delivered || 0}</div>
                        </div>
                        <div className="card p-6 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-surface-color text-black"><TrendingUp /></div>
                            <div className="text-sm text-secondary font-medium">Total Revenue</div>
                            <div className="text-2xl font-bold mt-1">₹{wallet?.total_revenue || 0}</div>
                        </div>
                        <div className="card p-6 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="mb-4 p-3 rounded-full bg-surface-color text-success-color"><CreditCard /></div>
                            <div className="text-sm text-secondary font-medium">Received</div>
                            <div className="text-2xl font-bold mt-1">₹{wallet?.total_paid || 0}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Recent Orders</h3>
                                <button className="btn btn-outline text-xs py-1" onClick={() => setActiveTab('orders')}>View All</button>
                            </div>
                            <div className="space-y-4">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order._id} className="flex items-center justify-between p-3 border border-border-color rounded-md hover:border-secondary transition-colors">
                                        <div>
                                            <div className="text-sm font-bold">{order.order_id}</div>
                                            <div className="text-xs text-secondary">₹{order.total_amount}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-warning'} scale-75 origin-right`}>{order.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="btn btn-outline py-6 flex flex-col gap-3 h-auto" onClick={() => setActiveTab('products')}>
                                    <Plus className="text-secondary" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Add Product</span>
                                </button>
                                <button className="btn btn-outline py-6 flex flex-col gap-3 h-auto" onClick={() => exportToExcel(orders, 'Vendor_Orders')}>
                                    <FileText className="text-secondary" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Export XLSX</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="card p-6 animate-fade-in border-none shadow-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-6 min-w-[600px]">
                        <h3 className="text-xl font-bold">Order Management</h3>
                    </div>
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="border-b border-border-color">
                            <tr className="text-secondary uppercase text-xs font-bold tracking-wider">
                                <th className="py-4">Order ID</th>
                                <th className="py-4">Amount</th>
                                <th className="py-4">Status</th>
                                <th className="py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((row) => (
                                <tr key={row._id} className="border-b border-border-color hover:bg-surface-color transition-colors">
                                    <td className="py-4 font-bold">{row.order_id}</td>
                                    <td className="py-4 font-bold">₹{row.total_amount}</td>
                                    <td className="py-4">
                                        <select
                                            value={row.status}
                                            onChange={(e) => updateStatus(row._id, e.target.value)}
                                            className="text-xs font-bold p-1 bg-surface-color border-none rounded outline-none"
                                        >
                                            {['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="py-4 flex gap-2">
                                        <button className="btn btn-outline py-1 px-3 text-xs" onClick={() => handleInvoice(row)}>Invoice</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Products management can follow same CRUD pattern... */}
        </div>
    );
}
