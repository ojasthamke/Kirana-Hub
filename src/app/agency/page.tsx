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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'modalFadeIn 0.2s ease-out' }} onClick={onClose}>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPopUp { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .m-content { animation: modalPopUp 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
      <div className="m-content" style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
          <button onClick={onClose} style={{ width: 36, height: 36, border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={18} /></button>
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
  const [cats, setCats] = useState(DEFAULT_CATS);

  interface ProductForm { name_en: string; name_hi: string; image_url: string; category: string; price: string; stock: string; unit: string; min_qty: string; status: string; offer: string; variants: Variant[]; }
  const emptyP: ProductForm = { name_en: '', name_hi: '', image_url: '', category: 'Pulses', price: '', stock: '', unit: 'kg', min_qty: '1', status: 'In Stock', offer: '', variants: [] };
  const [pf, setPf] = useState<ProductForm>(emptyP);

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
      if (Array.isArray(pd)) {
        setProducts(pd);
        const prodCats = pd.map((p: Product) => p.category);
        setCats(Array.from(new Set([...DEFAULT_CATS, ...prodCats])));
      }
      if (wd && typeof wd === 'object' && !wd.error && 'totalRevenue' in wd) setWallet(wd);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(), 30000);
    return () => clearInterval(t);
  }, [load]);

  const updateOrder = async (id: string, updates: any) => {
    setUpdatingId(id);
    try {
      const res = await apiFetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      if (res.ok) await load(); else alert('Error updating');
    } catch { }
    setUpdatingId(null);
  };

  const saveProduct = async () => {
    setSaving(true); setErr('');
    const body: any = { ...pf, price: Number(pf.price), stock: Number(pf.stock), min_qty: Number(pf.min_qty), variants: pf.variants.map(v => ({ ...v, price: Number(v.price), stock: Number(v.stock), min_qty: Number(v.min_qty) })) };
    if (!pf.offer) delete body.offer;
    try {
      const method = modal === 'add' ? 'POST' : 'PATCH';
      const payload = modal === 'edit' ? { productId: sel!._id, ...body } : body;
      const r = await apiFetch('/api/agency/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (r.ok) { setModal(null); load(); } else setErr('Server Error');
    } catch { setErr('Network error'); }
    setSaving(false);
  };

  const deleteProd = async (id: string) => {
    if (!confirm('Delete?')) return;
    await apiFetch('/api/agency/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) });
    load();
  };

  const openEdit = (p: Product) => {
    setSel(p);
    setPf({ name_en: p.name_en, name_hi: p.name_hi, category: p.category, price: String(p.price), stock: String(p.stock), unit: p.unit || 'kg', min_qty: String(p.min_qty || 1), status: p.status, offer: p.offer || '', image_url: p.image_url || '', variants: p.variants || [] });
    setModal('edit');
  };

  const fOrders = orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || (o.user_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const fProducts = products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return null;

  return (
    <>
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Agency Dashboard • LIVE</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>My Agency Control</h1>
            </div>
            <button onClick={() => load()} style={{ padding: '0.6rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
              <RefreshCw size={16} /> Sync
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { l: 'Revenue', v: `₹${wallet.totalRevenue}` },
              { l: 'Pending', v: `₹${wallet.pendingAmount}` },
              { l: 'Orders', v: wallet.orderCount },
              { l: 'Products', v: products.length },
              { l: 'Cash', v: orders.filter(o => o.payment_method === 'Cash').length },
              { l: 'Online', v: orders.filter(o => o.payment_method === 'Online').length },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{s.l}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem' }}>
              {['overview', 'orders', 'products'].map(t => (
                <button key={t} onClick={() => setTab(t as any)} style={{ padding: '0.5rem 1rem', borderRadius: 8, background: tab === t ? '#fff' : 'transparent', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', color: tab === t ? '#0f172a' : '#64748b' }}> {t.toUpperCase()} </button>
              ))}
            </div>
            {tab !== 'overview' && <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}> <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /> <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }} /> </div>}
          </div>

          {tab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Products List</h2>
                <button onClick={() => { setPf(emptyP); setModal('add'); }} style={{ padding: '0.6rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>+ Add Product</button>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {fProducts.map(p => (
                      <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.image_url || '/logo.png'} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                          <div> <div style={{ fontWeight: 800 }}>{p.name_en}</div> <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.name_hi}</div> </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#64748b' }}>{p.category}</td>
                        <td style={{ padding: '1rem', fontWeight: 800 }}>₹{p.price}</td>
                        <td style={{ padding: '1rem' }}>{p.stock}</td>
                        <td style={{ padding: '1rem' }}><Badge s={p.status} /></td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => openEdit(p)} style={{ padding: '0.4rem', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }}><Edit2 size={14} /></button>
                            <button onClick={() => deleteProd(p._id)} style={{ padding: '0.4rem', border: '1px solid #fee2e2', borderRadius: 8, color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {['Customer', 'Items', 'Total', 'Payment', 'Order Status', 'Date', 'View'].map(h => <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fOrders.map(o => (
                  <tr key={o._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}> <div style={{ fontWeight: 800 }}>{o.user_id?.name}</div> <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.user_id?.phone}</div> </td>
                    <td style={{ padding: '1rem' }}>{o.products.length} Items</td>
                    <td style={{ padding: '1rem', fontWeight: 900 }}>₹{o.total_amount}</td>
                    <td style={{ padding: '1rem' }}> <Badge s={o.payment_method} /> <div style={{ marginTop: 4 }}> <Badge s={o.payment_status} /> </div> </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Badge s={o.status} />
                        {o.status === 'Pending' && <button onClick={() => updateOrder(o._id, { status: 'Accepted' })} style={{ padding: '0.3rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>Accept</button>}
                        {o.status === 'Accepted' && <button onClick={() => updateOrder(o._id, { status: 'Delivered' })} style={{ padding: '0.3rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}>Deliver</button>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}> <button onClick={() => { setSelectedOrder(o); setModal('details'); }} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer' }}><Eye size={16} /></button> </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                {orders.slice(0, 5).map(o => <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dotted #f1f5f9' }}> <div> <div style={{ fontWeight: 700 }}>#{o.order_id?.slice(-6)}</div> <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.user_id?.name} · ₹{o.total_amount}</div> </div> <Badge s={o.status} /> </div>)}
              </div>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Inventory Watch</h3>
                {products.filter(p => Number(p.stock) < 10).map(p => <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}> <div style={{ fontWeight: 700 }}>{p.name_en}</div> <div style={{ color: '#dc2626', fontWeight: 800 }}>Low Stock: {p.stock}</div> </div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal === 'details' && selectedOrder && (
        <Modal title="Detailed Order View" onClose={() => setModal(null)} maxWidth={600}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div> <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>PLACED AT</div> <div style={{ fontWeight: 800 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</div> </div>
              <div style={{ textAlign: 'right' }}> <Badge s={selectedOrder.status} /> </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14 }}>
              <div style={{ fontWeight: 900, color: '#0f172a' }}>{selectedOrder.user_id?.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>📞 {selectedOrder.user_id?.phone}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 8 }}>📍 {selectedOrder.user_id?.address}</div>
            </div>
            <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr> <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item</th> <th style={{ textAlign: 'center' }}>Price</th> <th style={{ textAlign: 'center' }}>Qty</th> <th style={{ textAlign: 'right', padding: '0.75rem' }}>Total</th> </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem' }}> <div style={{ fontWeight: 700 }}>{p.name_en || p.name}</div> {p.variant_name && <div style={{ fontSize: '0.65rem', color: '#2563eb' }}>{p.variant_name}</div>} </td>
                      <td style={{ textAlign: 'center' }}>₹{p.price}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800 }}>{p.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 900 }}>₹{p.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: 16, color: '#fff' }}>
              <div style={{ fontWeight: 700 }}>Total Payable</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>₹{selectedOrder.total_amount}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { updateOrder(selectedOrder._id, { status: 'Delivered' }); setModal(null); }} style={{ flex: 1, padding: '1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>MARK DELIVERED</button>
              <button onClick={() => setModal(null)} style={{ padding: '1rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>CLOSE</button>
            </div>
          </div>
        </Modal>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)} maxWidth={800}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <SI label="English Name"><Inp value={pf.name_en} onChange={(e: any) => setPf(p => ({ ...p, name_en: e.target.value }))} /></SI>
                <SI label="Hindi Name"><Inp value={pf.name_hi} onChange={(e: any) => setPf(p => ({ ...p, name_hi: e.target.value }))} /></SI>
              </div>
              <SI label="Image URL"><Inp value={pf.image_url} onChange={(e: any) => setPf(p => ({ ...p, image_url: e.target.value }))} /></SI>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <SI label="Price"><Inp type="number" value={pf.price} onChange={(e: any) => setPf(p => ({ ...p, price: e.target.value }))} /></SI>
                <SI label="Stock"><Inp type="number" value={pf.stock} onChange={(e: any) => setPf(p => ({ ...p, stock: e.target.value }))} /></SI>
              </div>
              <button onClick={saveProduct} disabled={saving} style={{ padding: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', marginTop: 'auto' }}> {saving ? 'Saving...' : 'SAVE PRODUCT'} </button>
            </div>
            <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}> <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>VARIANTS</p> <button onClick={() => setPf(p => ({ ...p, variants: [...p.variants, { variant_name: '', price: 0, stock: 0, unit: 'pcs', min_qty: 1, status: 'In Stock' }] }))} style={{ padding: '0.4rem', background: '#f1f5f9', border: 'none', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>+ ADD</button> </div>
              <div style={{ maxHeight: 350, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pf.variants.map((v, i) => (
                  <div key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 10, position: 'relative', border: '1px solid #e2e8f0' }}>
                    <button onClick={() => setPf(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}><X size={14} /></button>
                    <Inp placeholder="Name" value={v.variant_name} onChange={(e: any) => { const vs = [...pf.variants]; vs[i].variant_name = e.target.value; setPf({ ...pf, variants: vs }); }} style={{ padding: '0.4rem', fontSize: '0.8rem', marginBottom: 4 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      <Inp type="number" placeholder="Price" value={v.price} onChange={(e: any) => { const vs = [...pf.variants]; vs[i].price = e.target.value; setPf({ ...pf, variants: vs }); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                      <Inp type="number" placeholder="Stock" value={v.stock} onChange={(e: any) => { const vs = [...pf.variants]; vs[i].stock = e.target.value; setPf({ ...pf, variants: vs }); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
