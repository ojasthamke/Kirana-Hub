'use client';
import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, TrendingUp, Plus, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

interface Order { _id: string; order_id: string; total_amount: number; status: string; createdAt: string; products: any[]; user_id?: { name: string; phone: string; address: string } | null; }
interface Product { _id: string; name_en: string; name_hi: string; category: string; price: number; stock: number; status: string; offer?: string; }
interface Wallet { totalRevenue: number; pendingAmount: number; totalPaid: number; orderCount: number; }

const CATS = ['Pulses', 'Rice', 'Staples', 'Spices', 'Oil', 'Flour', 'Sugar', 'Dry Fruits', 'Other'];
const STATUSES = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const Badge = ({ s }: { s: string }) => {
  const m: Record<string, string[]> = {
    'In Stock': ['#dcfce7', '#15803d'], Delivered: ['#dcfce7', '#15803d'],
    'Out of Stock': ['#fee2e2', '#dc2626'], Cancelled: ['#fee2e2', '#dc2626'],
    Pending: ['#fef9c3', '#92400e'], Processing: ['#dbeafe', '#1d4ed8'],
    Accepted: ['#dbeafe', '#1d4ed8'], 'Out for Delivery': ['#ede9fe', '#6d28d9'],
  };
  const [bg, color] = m[s] || ['#f1f5f9', '#475569'];
  return <span style={{ background: bg, color, fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{s}</span>;
};

const Modal = ({ title, onClose, children }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
        <button onClick={onClose} style={{ width: 32, height: 32, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
      </div>
      <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>
    </div>
  </div>
);

export default function VendorPage() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ totalRevenue: 0, pendingAmount: 0, totalPaid: 0, orderCount: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [sel, setSel] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const emptyP = { name_en: '', name_hi: '', category: 'Pulses', price: '', stock: '', status: 'In Stock', offer: '' };
  const [pf, setPf] = useState(emptyP);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [or, pr, wr] = await Promise.all([fetch('/api/orders'), fetch('/api/vendor/products'), fetch('/api/vendor/wallet')]);
      const [od, pd, wd] = await Promise.all([or.json(), pr.json(), wr.json()]);
      if (Array.isArray(od)) setOrders(od);
      if (Array.isArray(pd)) setProducts(pd);
      if (wd && !wd.error) setWallet(wd);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateOrder = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const saveProduct = async () => {
    setSaving(true); setErr('');
    const body = { ...pf, price: Number(pf.price), stock: Number(pf.stock) };
    if (!pf.offer) delete (body as any).offer;
    try {
      const url = '/api/vendor/products';
      const method = modal === 'add' ? 'POST' : 'PATCH';
      const payload = modal === 'edit' ? { productId: sel!._id, ...body } : body;
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!d.success) { setErr(d.error || 'Failed'); setSaving(false); return; }
      setModal(null); setPf(emptyP); load();
    } catch { setErr('Something went wrong.'); }
    setSaving(false);
  };

  const deleteProd = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch('/api/vendor/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    load();
  };

  const openEdit = (p: Product) => {
    setSel(p);
    setPf({ name_en: p.name_en, name_hi: p.name_hi, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status, offer: p.offer || '' });
    setModal('edit');
  };

  const SI = (p: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{p.label}</label>
      {p.children}
    </div>
  );

  const Inp = (p: any) => <input {...p} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9375rem', width: '100%', outline: 'none', boxSizing: 'border-box' }} />;
  const Sel = ({ opts, ...p }: any) => (
    <select {...p} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9375rem', background: '#fff', outline: 'none', width: '100%' }}>
      {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading dashboard...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: '0.25rem' }}>Vendor Dashboard</p>
            <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginBottom: '0.25rem', fontFamily: 'Outfit,sans-serif' }}>My Store</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Manage products, fulfil orders, track earnings.</p>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { l: 'Revenue', v: `₹${wallet.totalRevenue.toLocaleString()}` },
            { l: 'Pending', v: `₹${wallet.pendingAmount.toLocaleString()}` },
            { l: 'Total Orders', v: wallet.orderCount },
            { l: 'My Products', v: products.length },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '0.5rem' }}>{s.l}</div>
              <div style={{ fontSize: '1.625rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.04em', color: '#0f172a' }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem', gap: '0.2rem', marginBottom: '2rem', width: 'fit-content', overflowX: 'auto' }}>
          {[
            { id: 'overview', icon: <TrendingUp size={16} />, label: 'Overview' },
            { id: 'orders', icon: <ShoppingBag size={16} />, label: `Orders (${orders.length})` },
            { id: 'products', icon: <Package size={16} />, label: `Products (${products.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#0f172a' : '#64748b', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h3>
                <button onClick={() => setTab('orders')} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
              </div>
              {orders.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No orders yet.</p> : orders.slice(0, 5).map(o => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>#{o.order_id?.slice(-6) || o._id.slice(-6)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{o.total_amount}</div></div>
                  <Badge s={o.status} />
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>My Products</h3>
                <button onClick={() => setTab('products')} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}>Manage →</button>
              </div>
              {products.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No products yet. Add your first product!</p> : products.slice(0, 5).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name_en}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{p.price} · Stock: {p.stock}</div></div>
                  <Badge s={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Your Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                <ShoppingBag size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} /><p>No orders yet.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 800 }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      {['Order ID', 'Customer', 'Phone', 'Address', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>#{o.order_id?.slice(-6) || o._id.slice(-6)}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{o.user_id?.name || '—'}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <a href={`tel:${o.user_id?.phone}`} style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>{o.user_id?.phone || '—'}</a>
                          </td>
                          <td style={{ padding: '1rem', color: '#475569', fontSize: '0.8125rem', maxWidth: 160 }}>{o.user_id?.address || '—'}</td>
                          <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>₹{o.total_amount}</td>
                          <td style={{ padding: '1rem' }}>
                            <select value={o.status} onChange={e => updateOrder(o._id, e.target.value)}
                              style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none' }}>
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Products</h2>
              <button onClick={() => { setErr(''); setPf(emptyP); setModal('add'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={16} /> Add Product
              </button>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                <Package size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} /><p>No products yet. Click "Add Product" to get started.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 600 }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name_en}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{p.name_hi}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#475569' }}>{p.category}</td>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>₹{p.price}</td>
                          <td style={{ padding: '1rem', color: p.stock < 10 ? '#dc2626' : '#475569', fontWeight: p.stock < 10 ? 700 : 400 }}>{p.stock}</td>
                          <td style={{ padding: '1rem' }}><Badge s={p.status} /></td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEdit(p)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Edit2 size={14} /></button>
                              <button onClick={() => deleteProd(p._id)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)}>
          {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#dc2626', fontSize: '0.875rem' }}>{err}</div>}
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <SI label="Name (English)"><Inp placeholder="e.g. Toor Dal" value={pf.name_en} onChange={(e: any) => setPf(p => ({ ...p, name_en: e.target.value }))} /></SI>
              <SI label="Name (Hindi)"><Inp placeholder="e.g. तूर दाल" value={pf.name_hi} onChange={(e: any) => setPf(p => ({ ...p, name_hi: e.target.value }))} /></SI>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <SI label="Category"><Sel opts={CATS} value={pf.category} onChange={(e: any) => setPf(p => ({ ...p, category: e.target.value }))} /></SI>
              <SI label="Status"><Sel opts={['In Stock', 'Out of Stock']} value={pf.status} onChange={(e: any) => setPf(p => ({ ...p, status: e.target.value }))} /></SI>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <SI label="Price (₹)"><Inp type="number" min="0" placeholder="0" value={pf.price} onChange={(e: any) => setPf(p => ({ ...p, price: e.target.value }))} /></SI>
              <SI label="Stock Qty"><Inp type="number" min="0" placeholder="0" value={pf.stock} onChange={(e: any) => setPf(p => ({ ...p, stock: e.target.value }))} /></SI>
            </div>
            <SI label="Offer Badge (optional)"><Inp placeholder="e.g. Best Deal" value={pf.offer} onChange={(e: any) => setPf(p => ({ ...p, offer: e.target.value }))} /></SI>
            <button onClick={saveProduct} disabled={saving}
              style={{ padding: '0.75rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : (modal === 'add' ? 'Add Product' : 'Save Changes')}
            </button>
          </div>
        </Modal>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} tr:hover td{background:#f8fafc !important}`}</style>
    </div>
  );
}
