'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';

interface Order {
    _id: string;
    order_id: string;
    master_order_id: string;
    total_amount: number;
    status: 'Pending' | 'Accepted' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    payment_status: string;
    created_at: string;
    products: any[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'Pending': return <Clock className="text-warning-color" size={20} />;
            case 'Accepted': return <CheckCircle className="text-info-color" size={20} />;
            case 'Processing': return <Package className="text-secondary" size={20} />;
            case 'Out for Delivery': return <Truck className="text-accent-color" size={20} />;
            case 'Delivered': return <CheckCircle className="text-success-color" size={20} />;
            case 'Cancelled': return <XCircle className="text-error-color" size={20} />;
            default: return <Clock size={20} />;
        }
    };

    return (
        <div className="container py-12 animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">My Orders</h1>
                    <p className="text-secondary text-sm">Track your current and past wholesale purchases.</p>
                </div>
                <Link href="/" className="btn btn-primary px-6 py-2 text-sm">Start New Order</Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="card p-20 text-center border-dashed border-border-color opacity-50">
                    <Package className="mx-auto mb-6 text-secondary" size={48} strokeWidth={1} />
                    <p className="text-secondary text-lg">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="card p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-black transition-colors cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-surface-color rounded-lg">
                                    <StatusIcon status={order.status} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-secondary uppercase tracking-widest">Master Order ID</span>
                                        <span className="badge badge-info scale-75 origin-left">{order.master_order_id}</span>
                                    </div>
                                    <h3 className="text-lg font-bold">Order {order.order_id}</h3>
                                    <p className="text-secondary text-xs">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 md:text-center">
                                <div className="text-sm font-bold">₹{order.total_amount}</div>
                                <div className="text-xs text-secondary mt-1">{order.products.length} Products</div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex-1 md:flex-initial">
                                    <div className="text-xs font-bold text-secondary uppercase mb-1">Order Status</div>
                                    <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : order.status === 'Cancelled' ? 'badge-error' : 'badge-warning'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline p-2 px-3 text-xs flex gap-2"><FileText size={14} /> Invoice</button>
                                    <button className="btn btn-primary p-2 px-3 text-xs"><ChevronRight size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
