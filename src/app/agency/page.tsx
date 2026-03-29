'use client';
import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, TrendingUp, Plus, Edit2, Trash2, X, RefreshCw, Search, Banknote, CreditCard, Eye, Layers } from 'lucide-react';

interface Variant { variant_name: string; price: number; stock: number; unit: string; min_qty: number; status: string; offer?: string; }
interface Order { _id: string; order_id: string; total_amount: number; status: string; payment_status: string; payment_method: string; createdAt: string; products: any[]; user_id?: { _id: string; name: string; phone: string; address: string } | null; }
interface Product { _id: string; name_en: string; name_hi: string; category: string; price: number; stock: number; unit: string; min_qty: number; status: string; offer?: string; variants?: Variant[]; }
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

const Modal = ({ title, onClose, maxWidth = 520, children }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
        <button onClick={onClose} style={{ width: 32, height: 32, border: '1.5px solid #e2e8f0', borderRadius: 8, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
      </div>
      <div style={{ padding: '0 1.5rem 1.5rem' }}>{children}</div>
    </div>
  </div>
);

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
  const [userHistory, setUserHistory] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customCat, setCustomCat] = useState('');
  const [cats, setCats] = useState(DEFAULT_CATS);

  const emptyP = { name_en: '', name_hi: '', category: 'Pulses', price: '', stock: '', unit: 'kg', min_qty: '1', status: 'In Stock', offer: '', variants: [] as Variant[] };
  const [pf, setPf] = useState(emptyP);

  const load = useCallback(async () => {
    try {
      const [or, pr, wr] = await Promise.all([
        fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/orders').catch(() => null),
        fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/agency/products').catch(() => null),
        fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/agency/wallet').catch(() => null),
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
        const allCats = Array.from(new Set([...DEFAULT_CATS, ...prodCats]));
        setCats(allCats);
      }
      if (wd && typeof wd === 'object' && !wd.error && 'totalRevenue' in wd) {
        setWallet(wd);
      }
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selectedOrder?.user_id?._id) {
       const history = orders.filter(o => o.user_id?._id === selectedOrder.user_id?._id && o._id !== selectedOrder._id);
       setUserHistory(history);
    }
  }, [selectedOrder, orders]);

  const updateOrder = async (id: string, updates: any) => {
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    load();
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
    if (!pf.offer) delete (body as any).offer;

    console.log('DEBUG: Saving Product with Variants:', JSON.stringify(body, null, 2));

    try {
      const url = '/api/agency/products';
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
    await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/agency/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) });
    load();
  };

  const openEdit = (p: Product) => {
    setSel(p);
    setPf({ 
        name_en: p.name_en, 
        name_hi: p.name_hi, 
        category: p.category, 
        price: String(p.price), 
        stock: String(p.stock), 
        unit: p.unit || 'kg', 
        min_qty: String(p.min_qty || 1), 
        status: p.status, 
        offer: p.offer || '',
        variants: p.variants || []
    });
    setModal('edit');
  };

  const addVariant = () => {
    setPf(p => ({
        ...p,
        variants: [...p.variants, { variant_name: '', price: 0, stock: 0, unit: 'pcs', min_qty: 1, status: 'In Stock' }]
    }));
  };

  const removeVariant = (idx: number) => {
    setPf(p => ({ ...p, variants: p.variants.filter((_, i) => i !== idx) }));
  };

  const updateVariant = (idx: number, field: string, val: any) => {
    setPf(p => ({
        ...p,
        variants: p.variants.map((v, i) => i === idx ? { ...v, [field]: val } : v)
    }));
  };

  const addCustomCat = () => {
    const trimmed = customCat.trim();
    if (trimmed && !cats.includes(trimmed)) {
      setCats([...cats, trimmed]); setPf(p => ({ ...p, category: trimmed }));
    } else if (trimmed) { setPf(p => ({ ...p, category: trimmed })); }
    setCustomCat('');
  };

  const filteredOrders = orders.filter(o => o.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) || (o.user_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProducts = products.filter(p => p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: '0.25rem' }}>Agency Dashboard</p>
            <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', marginBottom: '0.25rem', fontFamily: 'Outfit,sans-serif' }}>My Agency</h1>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Auto-refreshes every 20s • Manage products, fulfil orders, track earnings.</p>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <RefreshCw size={15} /> Refresh Now
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { l: 'Revenue', v: `₹${wallet.totalRevenue.toLocaleString()}` },
            { l: 'Pending', v: `₹${wallet.pendingAmount.toLocaleString()}` },
            { l: 'Total Orders', v: wallet.orderCount },
            { l: 'My Products', v: products.length },
            { l: 'Cash Orders', v: orders.filter(o => o.payment_method === 'Cash').length },
            { l: 'Online Orders', v: orders.filter(o => o.payment_method === 'Online').length },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '0.5rem' }}>{s.l}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', letterSpacing: '-0.04em', color: '#0f172a' }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: '0.25rem', gap: '0.2rem', width: 'fit-content', overflowX: 'auto' }}>
            {[
              { id: 'overview', icon: <TrendingUp size={16} />, label: 'Overview' },
              { id: 'orders', icon: <ShoppingBag size={16} />, label: `Orders (${orders.length})` },
              { id: 'products', icon: <Package size={16} />, label: `Products (${products.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id as any); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.125rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#0f172a' : '#64748b', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {t.icon} {t.label}
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Products</h2>
              <button onClick={() => { setErr(''); setPf(emptyP); setModal('add'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                <Plus size={16} /> Add Product
              </button>
            </div>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', border: '1.5px dashed #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
                <Package size={40} strokeWidth={1} style={{ margin: '0 auto 1rem' }} />
                <p>{searchQuery ? 'No products match your search.' : 'No products yet. Click "Add Product" to get started.'}</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 800 }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      {['Product', 'Category', 'Price/Unit', 'Variants', 'Stock', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name_en}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.name_hi}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#475569' }}>{p.category}</td>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>₹{p.price}/ {p.unit}</td>
                          <td style={{ padding: '1rem' }}>
                            {p.variants && p.variants.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                    {p.variants.map((v, i) => <span key={i} style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontWeight: 700 }}>{v.variant_name}</span>)}
                                </div>
                            ) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No variants</span>}
                          </td>
                          <td style={{ padding: '1rem' }}>{p.stock}</td>
                          <td style={{ padding: '1rem' }}><Badge s={p.status} /></td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEdit(p)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer' }}><Edit2 size={14} /></button>
                              <button onClick={() => deleteProd(p._id)} style={{ padding: '0.35rem 0.625rem', borderRadius: 6, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={14} /></button>
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

        {tab === 'orders' && (
            /* ... previous orders table code ... */
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: 1000 }}>
                    <thead><tr style={{ background: '#f8fafc' }}>
                      {['Customer', 'Order ID', 'Items', 'Amount', 'Pay Type', 'Pay Status', 'Status', 'Date', 'View'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredOrders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>{o.user_id?.name || '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.user_id?.phone || '—'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.user_id?.address || '—'}</div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem' }}>#{o.order_id?.slice(-6) || o._id.slice(-6)}</td>
                          <td style={{ padding: '1rem', color: '#64748b' }}>{o.products?.length || 0} items</td>
                          <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>₹{o.total_amount}</td>
                          <td style={{ padding: '1rem' }}>
                            {o.payment_method === 'Cash' ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 700, fontSize: '0.8rem' }}><Banknote size={14} /> Cash</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#2563eb', fontWeight: 700, fontSize: '0.8rem' }}><CreditCard size={14} /> Online</span>}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <select value={o.payment_status} onChange={e => updateOrder(o._id, { payment_status: e.target.value })} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none', color: o.payment_status === 'Paid' ? '#16a34a' : '#dc2626' }}> {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)} </select>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <select value={o.status} onChange={e => updateOrder(o._id, { status: e.target.value })} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', outline: 'none' }}> {STATUSES.map(s => <option key={s} value={s}>{s}</option>)} </select>
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => { setSelectedOrder(o); setModal('details'); }} style={{ padding: '0.35rem', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer' }}><Eye size={14} color="#475569" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
        )}

        {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h3>
              </div>
              {orders.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No orders yet.</p> : orders.slice(0, 5).map(o => (
                <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
                   <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>#{o.order_id?.slice(-6)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{o.total_amount} · {o.payment_method}</div>
                   </div>
                   <Badge s={o.status} />
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Products</h3>
              {products.slice(0, 5).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name_en}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₹{p.price}/{p.unit}</div>
                  </div>
                  <Badge s={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)} maxWidth={700}>
          {err && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: 8, color: '#dc2626', fontSize: '0.875rem' }}>{err}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <SI label="NameEn"><Inp value={pf.name_en} onChange={(e: any) => setPf(p => ({ ...p, name_en: e.target.value }))} /></SI>
                <SI label="NameHi"><Inp value={pf.name_hi} onChange={(e: any) => setPf(p => ({ ...p, name_hi: e.target.value }))} /></SI>
                </div>
                <SI label="Category">
                    <select value={pf.category} onChange={(e: any) => setPf(p => ({ ...p, category: e.target.value }))} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </SI>
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Default Configuration</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <SI label="Price (₹)"><Inp type="number" value={pf.price} onChange={(e: any) => setPf(p => ({ ...p, price: e.target.value }))} /></SI>
                    <SI label="Unit"><select value={pf.unit} onChange={(e: any) => setPf(p => ({ ...p, unit: e.target.value }))} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}> {UNITS.map(u => <option key={u} value={u}>{u}</option>)} </select></SI>
                    <SI label="Min Qty"><Inp type="number" value={pf.min_qty} onChange={(e: any) => setPf(p => ({ ...p, min_qty: e.target.value }))} /></SI>
                    <SI label="Stock"><Inp type="number" value={pf.stock} onChange={(e: any) => setPf(p => ({ ...p, stock: e.target.value }))} /></SI>
                    <SI label="Status"><select value={pf.status} onChange={(e: any) => setPf(p => ({ ...p, status: e.target.value }))} style={{ padding: '0.65rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}> <option value="In Stock">In Stock</option><option value="Out of Stock">Out of Stock</option> </select></SI>
                    </div>
                </div>
            </div>

            <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Packaging Variants (Box, Pouch, etc.)</p>
                    <button onClick={addVariant} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}> <Plus size={14} /> Add Variant </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 400, overflow: 'auto' }}>
                    {pf.variants.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 12, color: '#94a3b8', fontSize: '0.85rem' }}>No alternate packaging added.<br/>Add variants like "Box" or "Pouch" here.</div>}
                    {pf.variants.map((v, i) => (
                        <div key={i} style={{ padding: '1rem', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, position: 'relative' }}>
                            <button onClick={() => removeVariant(i)} style={{ position: 'absolute', top: 8, right: 8, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            <SI label="Variant Name (e.g. Box, 5kg Pouch)"><Inp placeholder="Box / Pouch / Case" value={v.variant_name} onChange={(e: any) => updateVariant(i, 'variant_name', e.target.value)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} /></SI>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <SI label="Price (₹)"><Inp type="number" value={v.price} onChange={(e: any) => updateVariant(i, 'price', e.target.value)} style={{ padding: '0.4rem' }} /></SI>
                                <SI label="Stock"><Inp type="number" value={v.stock} onChange={(e: any) => updateVariant(i, 'stock', e.target.value)} style={{ padding: '0.4rem' }} /></SI>
                                <SI label="Min Qty"><Inp type="number" value={v.min_qty} onChange={(e: any) => updateVariant(i, 'min_qty', e.target.value)} style={{ padding: '0.4rem' }} /></SI>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <button onClick={saveProduct} disabled={saving} style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}> {saving ? 'Saving...' : 'Save Product & Variants'} </button>
        </Modal>
      )}

      {modal === 'details' && selectedOrder && (
          <Modal title="Order Details" onClose={() => setModal(null)}>
              {/* Previous details modal content remains same */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Placed On</div>
                        <div style={{ fontWeight: 700 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    </div>
                    <Badge s={selectedOrder.status} />
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 14 }}>
                    <div style={{ fontWeight: 800 }}>{selectedOrder.user_id?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>📞 {selectedOrder.user_id?.phone}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 8 }}>📍 {selectedOrder.user_id?.address}</div>
                </div>
                <div style={{ border: '1.5px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr style={{ fontSize: '0.75rem' }}><th style={{ padding: '0.5rem', textAlign: 'left' }}>Item</th><th style={{ padding: '0.5rem' }}>Qty</th><th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th></tr>
                        </thead>
                        <tbody>
                            {selectedOrder.products.map((p: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc', fontSize: '0.85rem' }}>
                                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{p.name || p.name_en}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>{p.quantity}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{p.total}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ background: '#0f172a', color: '#fff' }}>
                            <tr><td colSpan={2} style={{ padding: '0.5rem', fontWeight: 700 }}>Total</td><td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800 }}>₹{selectedOrder.total_amount}</td></tr>
                        </tfoot>
                    </table>
                </div>
              </div>
          </Modal>
      )}
    </div>
  );
}
