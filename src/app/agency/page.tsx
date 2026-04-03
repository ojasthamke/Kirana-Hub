'use client';
import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, TrendingUp, Plus, Edit2, Trash2, X, RefreshCw, Search, Banknote, CreditCard, Eye, Layers } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Variant { variant_name: string; price: number; stock: number; unit: string; min_qty: number; status: string; offer?: string; }
interface Order { _id: string; order_id: string; total_amount: number; status: string; payment_status: string; payment_method: string; createdAt: string; products: any[]; user_id?: { _id: string; name: string; phone: string; address: string } | null; }
interface Product { _id: string; name_en: string; name_hi: string; image_url?: string; category: string; price: number; stock: number; unit: string; min_qty: number; status: string; offer?: string; variants?: Variant[]; }
interface Wallet { totalRevenue: number; pendingAmount: number; totalPaid: number; orderCount: number; }

const DEFAULT_CATS = ['Pulses', 'Rice', 'Staples', 'Spices', 'Oil', 'Flour', 'Sugar', 'Dry Fruits', 'Other'];
const STATUSES = ['Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Pending Approval'];
const UNITS = ['kg', 'g', 'pcs', 'pack', 'liter', 'ml'];

const Badge = ({ s }: { s: string }) => {
  const m: Record<string, string[]> = {
    'In Stock': ['#dcfce7', '#15803d'], Delivered: ['#dcfce7', '#15803d'], Paid: ['#dcfce7', '#15803d'],
    'Out of Stock': ['#fee2e2', '#dc2626'], Cancelled: ['#fee2e2', '#dc2626'], Unpaid: ['#fee2e2', '#dc2626'],
    Pending: ['#fef9c3', '#92400e'], Processing: ['#dbeafe', '#1d4ed8'],
    Accepted: ['#dbeafe', '#1d4ed8'], 'Out for Delivery': ['#ede9fe', '#6d28d9'],
    'Pending Approval': ['#fef9c3', '#92400e'],
    Cash: ['#fef3c7', '#d97706'], Online: ['#eff6ff', '#2563eb'],
  };
  const [bg, color] = m[s] || ['#f1f5f9', '#475569'];
  return <span style={{ background: bg, color, fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{s}</span>;
};

const Modal = ({ title, onClose, maxWidth = 520, children }: any) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'modalFade 0.2s ease-out' }} onClick={onClose}>
      <style>{`
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-pop { animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
      <div className="modal-pop" style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ width: 36, height: 36, border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

const SI = (p: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{p.label}</label>
    {p.children}
  </div>
);

const Inp = (p: any) => <input {...p} style={{ padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9375rem', width: '100%', outline: 'none', boxSizing: 'border-box', ...p.style }} />;

export default function AgencyPage() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ totalRevenue: 0, pendingAmount: 0, totalPaid: 0, orderCount: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | 'details' | null>(null);
  const [sel, setSel] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customCat, setCustomCat] = useState('');
  const [cats, setCats] = useState(DEFAULT_CATS);

  const emptyP = { name_en: '', name_hi: '', image_url: '', category: 'Pulses', price: '', stock: '', unit: 'kg', min_qty: '1', status: 'In Stock', offer: '', variants: [] as Variant[] };
  const [pf, setPf] = useState(emptyP);

  const load = useCallback(async () => {
    try {
      const [or, pr, wr] = await Promise.all([
        apiFetch('/api/orders').catch(() => null),
        apiFetch('/api/agency/products').catch(() => null),
        apiFetch('/api/agency/wallet').catch(() => null),
      ]);
      if (or?.status === 401) { window.location.href = '/login'; return; }
      const [od, pd, wd] = await Promise.all([
        or?.json().catch(() => []),
        pr?.json().catch(() => []),
        wr?.json().catch(() => null),
      ]);
      if (Array.isArray(od)) setOrders(od);
      if (Array.isArray(pd)) setProducts(pd);
      if (wd && !wd.error) setWallet(wd);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateOrder = async (id: string, updates: any) => {
    setUpdatingId(id);
    try {
        const res = await apiFetch(`/api/orders/${id}`, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(updates) 
        });
        if (res.ok) await load();
    } catch { }
    setUpdatingId(null);
  };

  const saveProduct = async () => {
    setSaving(true); setErr('');
    const body = { 
        ...pf, 
        price: Number(pf.price), 
        stock: Number(pf.stock), 
        min_qty: Number(pf.min_qty),
        variants: pf.variants.map(v => ({...v, price: Number(v.price), stock: Number(v.stock), min_qty: Number(v.min_qty)}))
    };
    try {
      const url = '/api/agency/products';
      const method = modal === 'add' ? 'POST' : 'PATCH';
      const payload = modal === 'edit' ? { productId: sel!._id, ...body } : body;
      const r = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) { setModal(null); setPf(emptyP); load(); }
      else { const d = await r.json(); setErr(d.error || 'Failed'); }
    } catch { setErr('Something went wrong.'); }
    setSaving(false);
  };

  const deleteProd = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    await apiFetch('/api/agency/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    load();
  };

  const openEdit = (p: Product) => {
    setSel(p);
    setPf({ 
        name_en: p.name_en, name_hi: p.name_hi, category: p.category, 
        price: String(p.price), stock: String(p.stock), unit: p.unit || 'kg', 
        min_qty: String(p.min_qty || 1), status: p.status, offer: p.offer || '',
        image_url: p.image_url || '', variants: p.variants || []
    });
    setModal('edit');
  };

  const addVariant = () => setPf(p => ({ ...p, variants: [...p.variants, { variant_name: '', price: 0, stock: 0, unit: 'pcs', min_qty: 1, status: 'In Stock' }] }));
  const removeVariant = (idx: number) => setPf(p => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }));
  const updateVariant = (idx: number, field: string, val: any) => setPf(p => ({ ...p, variants: p.variants.map((v, i) => i === idx ? { ...v, [field]: val } : v) }));

  const addCustomCat = () => {
    const trimmed = customCat.trim();
    if (trimmed && !cats.includes(trimmed)) setCats([...cats, trimmed]);
    setPf(p => ({ ...p, category: trimmed || p.category }));
    setCustomCat('');
  };

  const filteredOrders = orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || (o.user_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProducts = products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff', gap: '1.5rem' }}>
      <img src="/logo.png" alt="KiranaHub" style={{ width: 80, height: 'auto', animation: 'bounce 0.8s infinite alternate' }} />
      <p style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>Agency Dashboard Loading...</p>
      <style>{`@keyframes bounce { from { transform: translateY(2px); } to { transform: translateY(-4px); } }`}</style>
    </div>
  );

  return (
    <>
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a' }}>Agency Dashboard</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800, border: '1px solid #bbf7d0' }}>
                  <div style={{ width: 5, height: 5, background: '#16a34a', borderRadius: '50%' }} /> LIVE SYNC
                </div>
              </div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: 'Outfit,sans-serif', fontWeight: 900 }}>My Agency Control</h1>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', fontWeight: 600 }}>Manage products, fulfil orders, and track your wholesale earnings instantly.</p>
            </div>
            <button onClick={() => load()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: '0.875rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
              <RefreshCw size={15} /> Refresh Dashboard
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { l: 'Revenue', v: `₹${wallet.totalRevenue.toLocaleString()}` },
              { l: 'Pending', v: `₹${wallet.pendingAmount.toLocaleString()}` },
              { l: 'Orders', v: wallet.orderCount },
              { l: 'Products', v: products.length },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>{s.l}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', color: '#0f172a' }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem', gap: '0.2rem' }}>
              {['overview', 'orders', 'products'].map(t => (
                <button key={t} onClick={() => { setTab(t as any); setSearchQuery(''); }} style={{ padding: '0.5rem 1.125rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0f172a' : '#64748b', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {tab !== 'overview' && (
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder={`Search ${tab}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', background: '#fff' }} />
              </div>
            )}
          </div>

          {tab === 'products' && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                  <tr style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Price</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.image_url || '/logo.png'} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: '#f8fafc', border: '1px solid #f1f5f9' }} />
                        <div><div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{p.name_en}</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.category}</div></div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>₹{p.price}/{p.unit}</td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: p.stock < 10 ? '#dc2626' : '#0f172a' }}>{p.stock}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}><Badge s={p.status} /></td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => openEdit(p)} style={{ padding: '0.4rem', borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}><Edit2 size={14} /></button>
                        <button onClick={() => deleteProd(p._id)} style={{ padding: '0.4rem', borderRadius: 8, background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => { setPf(emptyP); setModal('add'); }} style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#16a34a', color: '#fff', width: 60, height: 60, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 25px rgba(22,163,74,0.4)', zIndex: 100 }}><Plus size={28} /></button>
            </div>
          )}

          {tab === 'orders' && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1.5px solid #f1f5f9' }}>
                  <tr style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Order</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '1rem' }}><div style={{ fontWeight: 800 }}>#{o.order_id?.slice(-8)}</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{o.user_id?.name}</div></td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800 }}>₹{o.total_amount}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                         <select value={o.status} onChange={(e) => updateOrder(o._id, { status: e.target.value })} style={{ padding: '0.4rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, border: '1.5px solid #e2e8f0' }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}><button onClick={() => { setSelectedOrder(o); setModal('details'); }} style={{ padding: '0.5rem 1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Pending Orders</h3>
                {orders.filter(o => o.status === 'Pending').map(o => (
                  <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: 12, marginBottom: '0.5rem' }}>
                    <div><div style={{ fontWeight: 800 }}>#{o.order_id?.slice(-8)}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{o.total_amount}</div></div>
                    <Badge s={o.status} />
                  </div>
                ))}
              </div>
              <div style={{ background: '#0f172a', borderRadius: 16, padding: '1.5rem', color: '#fff' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Stock Alerts</h3>
                {products.filter(p => p.stock < 20).map(p => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: '0.5rem' }}>
                    <div><div style={{ fontWeight: 700 }}>{p.name_en}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.stock} units left</div></div>
                    <Badge s={p.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS (Liberated at Root) ── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)} maxWidth={800}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <SI label="Name (EN)"><Inp value={pf.name_en} onChange={(e: any) => setPf(p => ({ ...p, name_en: e.target.value }))} /></SI>
               <SI label="Name (HI)"><Inp value={pf.name_hi} onChange={(e: any) => setPf(p => ({ ...p, name_hi: e.target.value }))} /></SI>
               <SI label="Image URL"><Inp value={pf.image_url} onChange={(e: any) => setPf(p => ({ ...p, image_url: e.target.value }))} /></SI>
               <SI label="Category">
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <select value={pf.category} onChange={(e: any) => setPf(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}> {cats.map(c => <option key={c} value={c}>{c}</option>)} </select>
                    <button onClick={() => { const n = prompt('New Category:'); if (n) setCats([...cats, n]); }} style={{ padding: '0 0.8rem', background: '#f1f5f9', border: 'none', borderRadius: 8 }}>+</button>
                  </div>
               </SI>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <SI label="Price"><Inp type="number" value={pf.price} onChange={(e: any) => setPf(p => ({ ...p, price: e.target.value }))} /></SI>
                  <SI label="Stock"><Inp type="number" value={pf.stock} onChange={(e: any) => setPf(p => ({ ...p, stock: e.target.value }))} /></SI>
               </div>
               <button onClick={saveProduct} disabled={saving} style={{ width: '100%', padding: '1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Product'}</button>
            </div>
            <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Packaging Variants</p>
                  <button onClick={addVariant} style={{ background: '#0f172a', color: '#fff', padding: '0.3rem 0.7rem', borderRadius: 8, border: 'none', cursor: 'pointer' }}>+ Add</button>
               </div>
               <div style={{ maxHeight: 350, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pf.variants.map((v, i) => (
                    <div key={i} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, position: 'relative' }}>
                      <button onClick={() => removeVariant(i)} style={{ position: 'absolute', top: 5, right: 5, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      <SI label="Variant Name"><Inp value={v.variant_name} onChange={(e: any) => updateVariant(i, 'variant_name', e.target.value)} placeholder="e.g. 5kg Box" style={{ padding: '0.4rem' }} /></SI>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <SI label="Price"><Inp type="number" value={v.price} onChange={(e: any) => updateVariant(i, 'price', e.target.value)} style={{ padding: '0.4rem' }} /></SI>
                        <SI label="Stock"><Inp type="number" value={v.stock} onChange={(e: any) => updateVariant(i, 'stock', e.target.value)} style={{ padding: '0.4rem' }} /></SI>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          {err && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{err}</p>}
        </Modal>
      )}

      {modal === 'details' && selectedOrder && (
        <Modal title={`Order Details #${selectedOrder.order_id?.slice(-8)}`} onClose={() => setModal(null)} maxWidth={600}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Placed On</div><div style={{ fontWeight: 800 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</div></div>
              <Badge s={selectedOrder.status} />
            </div>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 16 }}>
              <div style={{ fontWeight: 800 }}>{selectedOrder.user_id?.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#475569' }}>📞 {selectedOrder.user_id?.phone}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>📍 {selectedOrder.user_id?.address}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}><th style={{ textAlign: 'left', padding: '0.5rem' }}>Item</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>
                {selectedOrder.products.map((p: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>{p.name_en || p.name} {p.variant_name && `(${p.variant_name})`}</td>
                    <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>₹{p.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={2} style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>Grand Total</td><td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.125rem' }}>₹{selectedOrder.total_amount}</td></tr>
              </tfoot>
            </table>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => updateOrder(selectedOrder._id, { status: 'Delivered' })} 
                style={{ flex: 1, padding: '0.875rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                 Mark Delivered
              </button>
              <button 
                onClick={() => { if(confirm('Cancel Order?')) updateOrder(selectedOrder._id, { status: 'Cancelled' }) }} 
                style={{ padding: '0.875rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                 <Trash2 size={18} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
